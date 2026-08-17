package com.antigravity.vehiclerentx.service;

import com.antigravity.vehiclerentx.model.CampusPricingPolicy;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class BookingPricingService {

    // Smart Intent Resolution
    public String resolveSmartBookingType(String pickupLocation, String dropLocation, Integer durationMinutes, String requestedType) {
        if (requestedType != null && ("TIME_BASED".equalsIgnoreCase(requestedType) || "PLACE_TO_PLACE".equalsIgnoreCase(requestedType))) {
            return requestedType.toUpperCase();
        }
        if (dropLocation != null && !dropLocation.trim().isEmpty() && !"None".equalsIgnoreCase(dropLocation)) {
            return "PLACE_TO_PLACE";
        }
        if (durationMinutes != null && durationMinutes > 0) {
            return "TIME_BASED";
        }
        return "TIME_BASED";
    }

    // Haversine Distance Estimator (in KM)
    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) return 3.5; // Default 3.5km fallback within campus
        final int R = 6371; // Radius of Earth in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        return Math.round(distance * 100.0) / 100.0;
    }

    // Comprehensive Fare Estimator
    public Map<String, Object> calculateFareEstimate(String bookingType, Integer durationMinutes, Double distanceKm, CampusPricingPolicy policy) {
        double baseFare = 15.0;
        double hourlyRate = 35.0;
        double perKmRate = 4.0;
        double perMinRate = 1.0;
        double minFare = 20.0;
        double securityDeposit = 250.0;

        if (policy != null) {
            if (policy.getHourlyRate() != null) hourlyRate = policy.getHourlyRate();
            if (policy.getSecurityDeposit() != null) securityDeposit = policy.getSecurityDeposit();
        }

        double fare = 0.0;
        int mins = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 60;
        double dist = (distanceKm != null && distanceKm > 0) ? distanceKm : 3.5;

        if ("TIME_BASED".equalsIgnoreCase(bookingType)) {
            double hours = mins / 60.0;
            fare = hourlyRate * hours;
        } else {
            fare = baseFare + (dist * perKmRate) + (mins * perMinRate);
            if (fare < minFare) fare = minFare;
        }

        double tax = Math.round((fare * 0.05) * 100.0) / 100.0; // 5% GST/Tax
        double estimatedTotal = Math.round((fare + tax + securityDeposit) * 100.0) / 100.0;

        Map<String, Object> result = new HashMap<>();
        result.put("bookingType", bookingType);
        result.put("baseFare", baseFare);
        result.put("hourlyRate", hourlyRate);
        result.put("perKmRate", perKmRate);
        result.put("perMinRate", perMinRate);
        result.put("estimatedDurationMins", mins);
        result.put("estimatedDistanceKm", dist);
        result.put("rideFare", Math.round(fare * 100.0) / 100.0);
        result.put("tax", tax);
        result.put("securityDeposit", securityDeposit);
        result.put("estimatedTotal", estimatedTotal);

        return result;
    }
}
