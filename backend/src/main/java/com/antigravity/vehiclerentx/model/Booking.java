package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "booking_reference", unique = true)
    private String bookingReference;

    @Column(name = "institution_id")
    private String institutionId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Column(name = "booking_type")
    private String bookingType = "TIME_BASED"; // TIME_BASED, PLACE_TO_PLACE, SMART

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "drop_location")
    private String dropLocation;

    @Column(name = "pickup_latitude")
    private Double pickupLatitude;

    @Column(name = "pickup_longitude")
    private Double pickupLongitude;

    @Column(name = "drop_latitude")
    private Double dropLatitude;

    @Column(name = "drop_longitude")
    private Double dropLongitude;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "expected_end_time")
    private String expectedEndTime;

    @Column(name = "actual_end_time")
    private String actualEndTime;

    @Column(name = "check_in_odometer")
    private Integer checkInOdometer = 0;

    @Column(name = "check_out_odometer")
    private Integer checkOutOdometer;

    @Column(name = "estimated_distance")
    private Double estimatedDistance = 0.0;

    @Column(name = "actual_distance")
    private Double actualDistance = 0.0;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration = 60; // minutes

    @Column(name = "actual_duration")
    private Integer actualDuration;

    @Column(name = "base_fare")
    private Double baseFare = 15.0;

    @Column(name = "hourly_rate")
    private Double hourlyRate = 35.0;

    @Column(name = "per_km_rate")
    private Double perKmRate = 4.0;

    @Column(name = "per_minute_rate")
    private Double perMinuteRate = 1.0;

    @Column(name = "security_deposit")
    private Double securityDeposit = 250.0;

    @Column(name = "estimated_fare")
    private Double estimatedFare = 0.0;

    @Column(name = "final_fare")
    private Double finalFare = 0.0;

    @Column(name = "total_cost")
    private Double totalCost = 0.0;

    private Double discount = 0.0;
    private Double tax = 0.0;
    private Double penalty = 0.0;

    @Column(name = "damage_fee")
    private Double damageFee = 0.0;

    @Column(name = "late_fee")
    private Double lateFee = 0.0;

    @Column(name = "cleaning_fee")
    private Double cleaningFee = 0.0;

    @Column(name = "battery_penalty")
    private Double batteryPenalty = 0.0;

    @Column(name = "payment_status")
    private String paymentStatus = "paid"; // pending, paid, refunded

    @Column(name = "booking_status")
    private String bookingStatus = "reserved"; // reserved, active, completed, cancelled

    @Column(name = "ride_status")
    private String rideStatus = "awaiting_pickup"; // awaiting_pickup, in_progress, ended

    private String status = "active"; // Legacy backward compatibility field

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }

    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }

    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }

    public Double getDropLatitude() { return dropLatitude; }
    public void setDropLatitude(Double dropLatitude) { this.dropLatitude = dropLatitude; }

    public Double getDropLongitude() { return dropLongitude; }
    public void setDropLongitude(Double dropLongitude) { this.dropLongitude = dropLongitude; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getExpectedEndTime() { return expectedEndTime; }
    public void setExpectedEndTime(String expectedEndTime) { this.expectedEndTime = expectedEndTime; }

    public String getActualEndTime() { return actualEndTime; }
    public void setActualEndTime(String actualEndTime) { this.actualEndTime = actualEndTime; }

    public Integer getCheckInOdometer() { return checkInOdometer; }
    public void setCheckInOdometer(Integer checkInOdometer) { this.checkInOdometer = checkInOdometer; }

    public Integer getCheckOutOdometer() { return checkOutOdometer; }
    public void setCheckOutOdometer(Integer checkOutOdometer) { this.checkOutOdometer = checkOutOdometer; }

    public Double getEstimatedDistance() { return estimatedDistance; }
    public void setEstimatedDistance(Double estimatedDistance) { this.estimatedDistance = estimatedDistance; }

    public Double getActualDistance() { return actualDistance; }
    public void setActualDistance(Double actualDistance) { this.actualDistance = actualDistance; }

    public Integer getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public Integer getActualDuration() { return actualDuration; }
    public void setActualDuration(Integer actualDuration) { this.actualDuration = actualDuration; }

    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(Double perKmRate) { this.perKmRate = perKmRate; }

    public Double getPerMinuteRate() { return perMinuteRate; }
    public void setPerMinuteRate(Double perMinuteRate) { this.perMinuteRate = perMinuteRate; }

    public Double getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(Double securityDeposit) { this.securityDeposit = securityDeposit; }

    public Double getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(Double estimatedFare) { this.estimatedFare = estimatedFare; }

    public Double getFinalFare() { return finalFare; }
    public void setFinalFare(Double finalFare) { this.finalFare = finalFare; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getPenalty() { return penalty; }
    public void setPenalty(Double penalty) { this.penalty = penalty; }

    public Double getDamageFee() { return damageFee; }
    public void setDamageFee(Double damageFee) { this.damageFee = damageFee; }

    public Double getLateFee() { return lateFee; }
    public void setLateFee(Double lateFee) { this.lateFee = lateFee; }

    public Double getCleaningFee() { return cleaningFee; }
    public void setCleaningFee(Double cleaningFee) { this.cleaningFee = cleaningFee; }

    public Double getBatteryPenalty() { return batteryPenalty; }
    public void setBatteryPenalty(Double batteryPenalty) { this.batteryPenalty = batteryPenalty; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public String getRideStatus() { return rideStatus; }
    public void setRideStatus(String rideStatus) { this.rideStatus = rideStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}