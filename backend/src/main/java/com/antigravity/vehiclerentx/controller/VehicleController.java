package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api")
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public VehicleController(VehicleRepository vehicleRepository, UserRepository userRepository,
                             BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/vehicles")
    public ResponseEntity<?> getVehicles(@RequestParam(name = "institutionId", required = false) String instId) {
        List<Vehicle> list = (instId != null && !instId.isBlank()) 
                ? vehicleRepository.findByInstitutionId(instId) 
                : vehicleRepository.findAll();
        List<Map<String, Object>> output = new ArrayList<>();
        
        for (Vehicle v : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("_id", v.getId().toString());
            map.put("id", v.getId());
            map.put("institutionId", v.getInstitutionId());
            map.put("name", v.getName());
            map.put("type", v.getType());
            map.put("model", v.getModel());
            map.put("plateNumber", v.getPlateNumber());
            map.put("status", v.getStatus());
            map.put("location", Map.of("lat", v.getLat() != null ? v.getLat() : 22.8021, "lng", v.getLng() != null ? v.getLng() : 81.7543));
            map.put("batteryLevel", v.getBatteryLevel() != null ? v.getBatteryLevel() : 100);
            map.put("rangeKm", v.getRangeKm() != null ? v.getRangeKm() : 80);
            map.put("checkInOdometer", v.getCheckInOdometer() != null ? v.getCheckInOdometer() : 0);
            map.put("healthIndex", v.getHealthIndex() != null ? v.getHealthIndex() : 100);
            output.add(map);
        }
        return ResponseEntity.ok(output);
    }

    @PostMapping("/vehicles")
    public ResponseEntity<?> registerVehicle(@RequestBody Map<String, Object> body) {
        String plateNumber = (String) body.get("plateNumber");
        String name = (String) body.get("name");
        String type = (String) body.getOrDefault("type", "scooter");
        String model = (String) body.get("model");
        String institutionId = (String) body.getOrDefault("institutionId", "IGNTU");

        if (plateNumber == null || plateNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle registration number (plate number) is mandatory."));
        }

        Optional<Vehicle> existing = vehicleRepository.findByPlateNumber(plateNumber.trim().toUpperCase());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Vehicle with registration number '" + plateNumber + "' is already registered on VehicleRentX."));
        }

        Vehicle v = new Vehicle();
        v.setName(name != null ? name : type.toUpperCase() + " " + plateNumber);
        v.setType(type);
        v.setModel(model != null ? model : "Standard Edition");
        v.setPlateNumber(plateNumber.trim().toUpperCase());
        v.setInstitutionId(institutionId);
        v.setStatus((String) body.getOrDefault("status", "available"));
        v.setBatteryLevel(Integer.parseInt(body.getOrDefault("batteryLevel", "100").toString()));
        v.setRangeKm(Integer.parseInt(body.getOrDefault("rangeKm", "85").toString()));
        v.setHealthIndex(100);
        v.setCheckInOdometer(0);
        v.setLat(22.8021);
        v.setLng(81.7543);

        vehicleRepository.save(v);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Vehicle registered and listed in campus fleet successfully!",
            "vehicleId", v.getId()
        ));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable("id") Integer id) {
        Optional<Vehicle> vOpt = vehicleRepository.findById(id);
        if (vOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Vehicle not found."));
        }
        vehicleRepository.delete(vOpt.get());
        return ResponseEntity.ok(Map.of("message", "Vehicle removed from fleet successfully."));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> body) {
        Object userIdObj = body.get("userId");
        Object vehicleIdObj = body.get("vehicleId");
        
        if (userIdObj == null || vehicleIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID and Vehicle ID are required."));
        }

        Integer userId = Integer.parseInt(userIdObj.toString());
        Integer vehicleId = Integer.parseInt(vehicleIdObj.toString());
        Integer checkInOdo = body.get("checkInOdometer") != null ? Integer.parseInt(body.get("checkInOdometer").toString()) : 0;

        Optional<Vehicle> vOpt = vehicleRepository.findById(vehicleId);
        if (vOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Vehicle not found."));
        }
        Vehicle vehicle = vOpt.get();

        if (!"available".equals(vehicle.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle is currently unavailable."));
        }

        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }
        User user = uOpt.get();

        double deposit = (user.getTrustScore() >= 90) ? 125.0 : 250.0;
        if (user.getWalletBalance() < deposit) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient wallet balance for security deposit hold."));
        }

        user.setWalletBalance(user.getWalletBalance() - deposit);
        userRepository.save(user);

        Payment holdPayment = new Payment();
        holdPayment.setInstitutionId(user.getInstitutionId());
        holdPayment.setUserId(userId);
        holdPayment.setAmount(deposit);
        holdPayment.setType("security_hold");
        holdPayment.setPaymentMethod("wallet");
        holdPayment.setDescription("Temporary Security Deposit Lock");
        paymentRepository.save(holdPayment);

        Booking booking = new Booking();
        booking.setInstitutionId(user.getInstitutionId());
        booking.setUserId(userId);
        booking.setVehicleId(vehicleId);
        booking.setStatus("active");
        booking.setStartTime(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        booking.setCheckInOdometer(checkInOdo);
        booking.setSecurityDeposit(deposit);
        bookingRepository.save(booking);

        vehicle.setStatus("booked");
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(Map.of(
            "_id", booking.getId().toString(),
            "status", "active",
            "userId", userId,
            "vehicleId", vehicleId,
            "inspection", Map.of("checkInOdometer", checkInOdo),
            "securityDepositPaid", deposit
        ));
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable("id") Integer bookingId, @RequestBody Map<String, Object> body) {
        Object checkOutOdoObj = body.get("checkOutOdometer");
        Integer checkOutOdo = checkOutOdoObj != null ? Integer.parseInt(checkOutOdoObj.toString()) : 0;

        Optional<Booking> bOpt = bookingRepository.findById(bookingId);
        if (bOpt.isEmpty() || !"active".equals(bOpt.get().getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active booking session found."));
        }
        Booking booking = bOpt.get();

        Optional<Vehicle> vOpt = vehicleRepository.findById(booking.getVehicleId());
        Optional<User> uOpt = userRepository.findById(booking.getUserId());

        if (vOpt.isEmpty() || uOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Related booking references not found."));
        }

        Vehicle vehicle = vOpt.get();
        User user = uOpt.get();

        LocalDateTime startTime = LocalDateTime.parse(booking.getStartTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        long durationMin = ChronoUnit.MINUTES.between(startTime, LocalDateTime.now());
        if (durationMin < 1) durationMin = 1;

        double rideCost = 10.0 + (durationMin * 2.0); 
        double deposit = booking.getSecurityDeposit();

        double refund = deposit - rideCost;
        user.setWalletBalance(user.getWalletBalance() + refund);
        user.setTrustScore(Math.min(100, user.getTrustScore() + 2));
        userRepository.save(user);

        Payment refundPayment = new Payment();
        refundPayment.setInstitutionId(user.getInstitutionId());
        refundPayment.setUserId(user.getId());
        refundPayment.setBookingId(bookingId);
        refundPayment.setAmount(deposit);
        refundPayment.setType("deposit_refund");
        refundPayment.setPaymentMethod("wallet");
        refundPayment.setDescription("Refunded Security Deposit");
        paymentRepository.save(refundPayment);

        Payment chargePayment = new Payment();
        chargePayment.setInstitutionId(user.getInstitutionId());
        chargePayment.setUserId(user.getId());
        chargePayment.setBookingId(bookingId);
        chargePayment.setAmount(rideCost);
        chargePayment.setType("ride_payment");
        chargePayment.setPaymentMethod("wallet");
        chargePayment.setDescription("Ride payment for " + durationMin + " minutes");
        paymentRepository.save(chargePayment);

        int finalOdo = Math.max(checkOutOdo, vehicle.getCheckInOdometer());
        int finalBattery = (int) Math.max(10, vehicle.getBatteryLevel() - (durationMin * 0.5));
        vehicle.setStatus("available");
        vehicle.setCheckInOdometer(finalOdo);
        vehicle.setBatteryLevel(finalBattery);
        vehicleRepository.save(vehicle);

        booking.setStatus("completed");
        booking.setEndTime(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        booking.setCheckOutOdometer(finalOdo);
        booking.setTotalCost(rideCost);
        bookingRepository.save(booking);

        return ResponseEntity.ok(Map.of(
            "_id", bookingId.toString(),
            "status", "completed",
            "durationMinutes", durationMin,
            "totalCost", rideCost,
            "inspection", Map.of("checkOutOdometer", finalOdo)
        ));
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable("userId") Integer userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByIdDesc(userId);
        List<Map<String, Object>> output = new ArrayList<>();

        for (Booking b : bookings) {
            Optional<Vehicle> vOpt = vehicleRepository.findById(b.getVehicleId());
            String vName = vOpt.isPresent() ? vOpt.get().getName() : "Hercules Cycle";
            String vModel = vOpt.isPresent() ? vOpt.get().getModel() : "Hercules";
            String vType = vOpt.isPresent() ? vOpt.get().getType() : "bicycle";

            output.add(Map.of(
                "_id", b.getId().toString(),
                "status", b.getStatus(),
                "startTime", b.getStartTime(),
                "endTime", b.getEndTime() != null ? b.getEndTime() : "",
                "totalCost", b.getTotalCost(),
                "securityDepositPaid", b.getSecurityDeposit(),
                "inspection", Map.of(
                    "checkInOdometer", b.getCheckInOdometer(),
                    "checkOutOdometer", b.getCheckOutOdometer() != null ? b.getCheckOutOdometer() : 0
                ),
                "vehicleId", Map.of(
                    "name", vName,
                    "model", vModel,
                    "type", vType
                )
            ));
        }
        return ResponseEntity.ok(output);
    }
}