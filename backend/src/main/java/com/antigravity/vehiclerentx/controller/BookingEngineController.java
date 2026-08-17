package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import com.antigravity.vehiclerentx.service.BookingPricingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingEngineController {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final CampusPricingPolicyRepository campusPricingPolicyRepository;
    private final BookingPricingService pricingService;

    public BookingEngineController(BookingRepository bookingRepository, VehicleRepository vehicleRepository,
                                   UserRepository userRepository, PaymentRepository paymentRepository,
                                   CampusPricingPolicyRepository campusPricingPolicyRepository,
                                   BookingPricingService pricingService) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.campusPricingPolicyRepository = campusPricingPolicyRepository;
        this.pricingService = pricingService;
    }

    // 1. Real-Time Fare Estimator Endpoint
    @PostMapping("/estimate")
    public ResponseEntity<?> estimateFare(@RequestBody Map<String, Object> body) {
        String pickup = (String) body.get("pickupLocation");
        String drop = (String) body.get("dropLocation");
        Integer duration = body.get("durationMinutes") != null ? Integer.parseInt(body.get("durationMinutes").toString()) : 60;
        String requestedType = (String) body.get("bookingType");
        String tenantId = (String) body.getOrDefault("institutionId", "IGNTU");
        Double pLat = body.get("pickupLat") != null ? Double.parseDouble(body.get("pickupLat").toString()) : 22.8021;
        Double pLng = body.get("pickupLng") != null ? Double.parseDouble(body.get("pickupLng").toString()) : 81.7543;
        Double dLat = body.get("dropLat") != null ? Double.parseDouble(body.get("dropLat").toString()) : 22.8035;
        Double dLng = body.get("dropLng") != null ? Double.parseDouble(body.get("dropLng").toString()) : 81.7560;

        String resolvedType = pricingService.resolveSmartBookingType(pickup, drop, duration, requestedType);
        double distanceKm = pricingService.calculateHaversineDistance(pLat, pLng, dLat, dLng);

        Optional<CampusPricingPolicy> policyOpt = campusPricingPolicyRepository.findByInstitutionIdAndVehicleType(tenantId, "scooter");
        Map<String, Object> estimate = pricingService.calculateFareEstimate(resolvedType, duration, distanceKm, policyOpt.orElse(null));
        estimate.put("resolvedBookingType", resolvedType);
        estimate.put("pickupLocation", pickup != null ? pickup : "Main Gate Station");
        estimate.put("dropLocation", drop != null ? drop : "Central Library Hub");

        return ResponseEntity.ok(estimate);
    }

    // 2. Production Multi-Model Booking Creator
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> body) {
        Integer userId = Integer.parseInt(body.get("userId").toString());
        Integer vehicleId = Integer.parseInt(body.get("vehicleId").toString());
        String tenantId = (String) body.getOrDefault("institutionId", "IGNTU");
        String pickup = (String) body.getOrDefault("pickupLocation", "Admin Gate");
        String drop = (String) body.getOrDefault("dropLocation", "Library Hub");
        Integer duration = body.get("durationMinutes") != null ? Integer.parseInt(body.get("durationMinutes").toString()) : 60;
        String requestedType = (String) body.get("bookingType");

        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        User user = uOpt.get();

        Optional<Vehicle> vOpt = vehicleRepository.findById(vehicleId);
        if (vOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Vehicle not found."));
        Vehicle vehicle = vOpt.get();

        // Double Booking & Availability Check
        List<Booking> activeVehicleBookings = bookingRepository.findByVehicleIdAndStatusIn(vehicleId, List.of("reserved", "active"));
        if (!activeVehicleBookings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Vehicle is currently reserved by another rider."));
        }

        String resolvedType = pricingService.resolveSmartBookingType(pickup, drop, duration, requestedType);
        double distKm = pricingService.calculateHaversineDistance(
                body.get("pickupLat") != null ? Double.parseDouble(body.get("pickupLat").toString()) : 22.8021,
                body.get("pickupLng") != null ? Double.parseDouble(body.get("pickupLng").toString()) : 81.7543,
                body.get("dropLat") != null ? Double.parseDouble(body.get("dropLat").toString()) : 22.8035,
                body.get("dropLng") != null ? Double.parseDouble(body.get("dropLng").toString()) : 81.7560
        );

        Optional<CampusPricingPolicy> policyOpt = campusPricingPolicyRepository.findByInstitutionIdAndVehicleType(tenantId, vehicle.getType());
        Map<String, Object> est = pricingService.calculateFareEstimate(resolvedType, duration, distKm, policyOpt.orElse(null));

        double totalRequired = (Double) est.get("estimatedTotal");
        if (user.getWalletBalance() < totalRequired) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Insufficient campus wallet balance. Required: ₹" + totalRequired + ", Available: ₹" + user.getWalletBalance()));
        }

        // Deduct Wallet Balance
        user.setWalletBalance(user.getWalletBalance() - totalRequired);
        userRepository.save(user);

        // Lock & Reserve Vehicle
        vehicle.setStatus("reserved");
        vehicleRepository.save(vehicle);

        // Create Booking Entity
        Booking booking = new Booking();
        booking.setBookingReference("VRX-" + System.currentTimeMillis() % 1000000);
        booking.setInstitutionId(tenantId);
        booking.setUserId(userId);
        booking.setVehicleId(vehicleId);
        booking.setBookingType(resolvedType);
        booking.setPickupLocation(pickup);
        booking.setDropLocation(drop);
        booking.setStartTime(LocalDateTime.now().toString());
        booking.setExpectedEndTime(LocalDateTime.now().plusMinutes(duration).toString());
        booking.setEstimatedDistance(distKm);
        booking.setEstimatedDuration(duration);
        booking.setBaseFare((Double) est.get("baseFare"));
        booking.setHourlyRate((Double) est.get("hourlyRate"));
        booking.setPerKmRate((Double) est.get("perKmRate"));
        booking.setPerMinuteRate((Double) est.get("perMinRate"));
        booking.setSecurityDeposit((Double) est.get("securityDeposit"));
        booking.setEstimatedFare((Double) est.get("estimatedTotal"));
        booking.setTotalCost(totalRequired);
        booking.setPaymentStatus("paid");
        booking.setBookingStatus("reserved");
        booking.setRideStatus("awaiting_pickup");
        booking.setStatus("active");
        bookingRepository.save(booking);

        // Record Payment Log
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setBookingId(booking.getId());
        payment.setAmount(totalRequired);
        payment.setType("ride_payment");
        payment.setPaymentMethod("Campus Wallet");
        payment.setTransactionId("TXN-" + System.currentTimeMillis());
        payment.setInstitutionId(tenantId);
        payment.setStatus("completed");
        payment.setDescription("Booking #" + booking.getBookingReference() + " (" + resolvedType + ")");
        paymentRepository.save(payment);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Booking confirmed successfully via " + resolvedType + "!");
        resp.put("booking", booking);
        resp.put("newWalletBalance", user.getWalletBalance());

        return ResponseEntity.ok(resp);
    }

    // 3. Start Ride
    @PutMapping("/{id}/start")
    public ResponseEntity<?> startRide(@PathVariable("id") Integer bookingId) {
        Optional<Booking> bOpt = bookingRepository.findById(bookingId);
        if (bOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Booking not found."));

        Booking b = bOpt.get();
        b.setBookingStatus("active");
        b.setRideStatus("in_progress");
        b.setStartTime(LocalDateTime.now().toString());
        bookingRepository.save(b);

        Optional<Vehicle> vOpt = vehicleRepository.findById(b.getVehicleId());
        if (vOpt.isPresent()) {
            Vehicle v = vOpt.get();
            v.setStatus("in_use");
            vehicleRepository.save(v);
        }

        return ResponseEntity.ok(Map.of("message", "Ride started! Vehicle unlocked. Drive safely within campus geofence.", "booking", b));
    }

    // 4. End Ride & Generate Final Invoice
    @PostMapping("/{id}/end")
    public ResponseEntity<?> endRide(@PathVariable("id") Integer bookingId, @RequestBody Map<String, Object> body) {
        Optional<Booking> bOpt = bookingRepository.findById(bookingId);
        if (bOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Booking not found."));

        Booking b = bOpt.get();
        b.setActualEndTime(LocalDateTime.now().toString());
        b.setBookingStatus("completed");
        b.setRideStatus("ended");
        b.setStatus("completed");

        // Calculate Late Return Fee (if returned past expected end time)
        double lateFee = 0.0;
        try {
            LocalDateTime expected = LocalDateTime.parse(b.getExpectedEndTime());
            if (LocalDateTime.now().isAfter(expected)) {
                long lateMins = java.time.Duration.between(expected, LocalDateTime.now()).toMinutes();
                lateFee = lateMins * 2.0; // ₹2/min late return penalty
            }
        } catch (Exception ignored) {}

        b.setLateFee(lateFee);
        b.setFinalFare(b.getTotalCost() + lateFee);
        bookingRepository.save(b);

        // Release Vehicle to Available
        Optional<Vehicle> vOpt = vehicleRepository.findById(b.getVehicleId());
        if (vOpt.isPresent()) {
            Vehicle v = vOpt.get();
            v.setStatus("available");
            vehicleRepository.save(v);
        }

        return ResponseEntity.ok(Map.of("message", "Ride completed! Thank you for using VehicleRentX.", "booking", b, "lateFeeCharged", lateFee));
    }

    // 5. My Rides History
    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides(@RequestParam("userId") Integer userId) {
        return ResponseEntity.ok(bookingRepository.findByUserIdOrderByIdDesc(userId));
    }
}
