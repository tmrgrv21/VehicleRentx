package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VehicleRepository vehicleRepository;
    private final NoticeRepository noticeRepository;
    private final InstitutionRepository institutionRepository;

    public AdminController(UserRepository userRepository, BookingRepository bookingRepository,
                           PaymentRepository paymentRepository, VehicleRepository vehicleRepository,
                           NoticeRepository noticeRepository, InstitutionRepository institutionRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.vehicleRepository = vehicleRepository;
        this.noticeRepository = noticeRepository;
        this.institutionRepository = institutionRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam(value = "institutionId", defaultValue = "SUPER") String instId) {
        long usersCount;
        long bookingsCount;
        Double revenue;

        if ("SUPER".equals(instId)) {
            usersCount = userRepository.count();
            bookingsCount = bookingRepository.count();
            revenue = paymentRepository.sumTotalRevenue();
        } else {
            usersCount = userRepository.findAll().stream().filter(u -> instId.equals(u.getInstitutionId())).count();
            bookingsCount = bookingRepository.countByInstitutionId(instId);
            revenue = paymentRepository.sumRevenueByInstitution(instId);
        }

        if (revenue == null) revenue = 0.0;

        return ResponseEntity.ok(Map.of(
            "totalUsers", usersCount,
            "totalBookings", bookingsCount,
            "totalRevenue", revenue
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> list = userRepository.findAll();
        List<Map<String, Object>> output = new ArrayList<>();

        for (User u : list) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("_id", u.getId().toString());
            uMap.put("fullName", u.getFullName());
            uMap.put("username", u.getUsername() != null ? u.getUsername() : "");
            uMap.put("email", u.getEmail());
            uMap.put("role", u.getRole());
            uMap.put("institutionId", u.getInstitutionId());
            uMap.put("walletBalance", u.getWalletBalance());
            uMap.put("trustScore", u.getTrustScore());
            uMap.put("kycStatus", u.getKycStatus());
            uMap.put("kyc", Map.of(
                "status", u.getKycStatus(),
                "aadhaarNumber", u.getKycAadhaar() != null ? u.getKycAadhaar() : "",
                "dlNumber", u.getKycDl() != null ? u.getKycDl() : "",
                "selfieUrl", u.getKycSelfieUrl() != null ? u.getKycSelfieUrl() : ""
            ));
            uMap.put("academicDetails", Map.of(
                "department", u.getAcademicDept() != null ? u.getAcademicDept() : "",
                "course", u.getAcademicCourse() != null ? u.getAcademicCourse() : "",
                "yearOrSemester", u.getAcademicYear() != null ? u.getAcademicYear() : "",
                "enrollmentNumber", u.getEnrollmentNumber() != null ? u.getEnrollmentNumber() : ""
            ));
            output.add(uMap);
        }
        return ResponseEntity.ok(output);
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(@RequestParam(value = "institutionId", defaultValue = "SUPER") String instId) {
        List<Booking> list;
        if ("SUPER".equals(instId)) {
            list = bookingRepository.findAll();
        } else {
            list = bookingRepository.findByInstitutionIdOrderByIdDesc(instId);
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (Booking b : list) {
            Optional<User> uOpt = userRepository.findById(b.getUserId());
            Optional<Vehicle> vOpt = vehicleRepository.findById(b.getVehicleId());

            output.add(Map.of(
                "_id", b.getId().toString(),
                "userName", uOpt.isPresent() ? uOpt.get().getFullName() : "User #" + b.getUserId(),
                "vehicleModel", vOpt.isPresent() ? vOpt.get().getModel() : "Vehicle #" + b.getVehicleId(),
                "status", b.getStatus(),
                "startTime", b.getStartTime(),
                "endTime", b.getEndTime() != null ? b.getEndTime() : "",
                "totalCost", b.getTotalCost(),
                "securityDeposit", b.getSecurityDeposit(),
                "institutionId", b.getInstitutionId()
            ));
        }
        return ResponseEntity.ok(output);
    }

    @GetMapping("/finance")
    public ResponseEntity<?> getFinance(@RequestParam(value = "institutionId", defaultValue = "SUPER") String instId) {
        List<Payment> list;
        if ("SUPER".equals(instId)) {
            list = paymentRepository.findAll();
        } else {
            list = paymentRepository.findByInstitutionIdOrderByIdDesc(instId);
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (Payment p : list) {
            Optional<User> uOpt = userRepository.findById(p.getUserId());
            output.add(Map.of(
                "_id", p.getId().toString(),
                "userName", uOpt.isPresent() ? uOpt.get().getFullName() : "User #" + p.getUserId(),
                "amount", p.getAmount(),
                "type", p.getType(),
                "paymentMethod", p.getPaymentMethod(),
                "transactionId", p.getTransactionId() != null ? p.getTransactionId() : "",
                "description", p.getDescription() != null ? p.getDescription() : "",
                "institutionId", p.getInstitutionId(),
                "createdAt", p.getCreatedAt().toString()
            ));
        }
        return ResponseEntity.ok(output);
    }

    @PutMapping("/users/{id}/kyc")
    public ResponseEntity<?> updateKYC(@PathVariable("id") Integer userId, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "approved");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        user.setKycStatus(status);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "KYC status set to " + status));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable("id") Integer userId, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User role updated to " + role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Integer userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<?> createVehicle(@RequestBody Map<String, Object> body) {
        String instId = (String) body.get("institutionId");
        String name = (String) body.get("name");
        String type = (String) body.getOrDefault("type", "bicycle");
        String model = (String) body.get("model");
        String plate = (String) body.get("plateNumber");

        Double lat = 0.0;
        Double lng = 0.0;
        if (body.get("currentLocation") != null) {
            Map<?, ?> loc = (Map<?, ?>) body.get("currentLocation");
            if (loc.get("lat") != null) lat = Double.parseDouble(loc.get("lat").toString());
            if (loc.get("lng") != null) lng = Double.parseDouble(loc.get("lng").toString());
        }

        if (instId == null || model == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required vehicle parameters."));
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setInstitutionId(instId);
        vehicle.setName(name != null ? name : model);
        vehicle.setType(type);
        vehicle.setModel(model);
        vehicle.setPlateNumber(plate != null ? plate : "");
        vehicle.setLat(lat);
        vehicle.setLng(lng);
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(Map.of("message", "Vehicle registered successfully"));
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<?> updateVehicleStatus(@PathVariable("id") Integer vehicleId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Optional<Vehicle> vOpt = vehicleRepository.findById(vehicleId);
        if (vOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Vehicle not found."));
        }

        Vehicle vehicle = vOpt.get();
        if (status != null) vehicle.setStatus(status);
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(Map.of("message", "Vehicle status updated"));
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable("id") Integer vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Vehicle not found."));
        }
        vehicleRepository.deleteById(vehicleId);
        return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully."));
    }

    @PostMapping("/notices")
    public ResponseEntity<?> createNotice(@RequestBody Map<String, String> body) {
        String instId = body.get("institutionId");
        String title = body.get("title");
        String type = body.getOrDefault("type", "notice");
        String content = body.get("content");

        if (instId == null || title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing notice variables."));
        }

        Notice notice = new Notice();
        notice.setInstitutionId(instId);
        notice.setTitle(title);
        notice.setType(type);
        notice.setContent(content);
        noticeRepository.save(notice);

        return ResponseEntity.ok(Map.of("message", "Announcement published successfully"));
    }

    @PostMapping("/tenants")
    public ResponseEntity<?> createTenant(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        String name = (String) body.get("name");
        String type = (String) body.getOrDefault("type", "central_university");
        String domain = (String) body.get("emailDomain");
        String primaryColor = (String) body.getOrDefault("primaryColor", "#15803D");
        String secondaryColor = (String) body.getOrDefault("secondaryColor", "#166534");

        Double lat = 0.0;
        Double lng = 0.0;
        if (body.get("location") != null) {
            Map<?, ?> loc = (Map<?, ?>) body.get("location");
            if (loc.get("lat") != null) lat = Double.parseDouble(loc.get("lat").toString());
            if (loc.get("lng") != null) lng = Double.parseDouble(loc.get("lng").toString());
        }

        if (code == null || name == null || domain == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing tenant details."));
        }

        Institution institution = new Institution();
        institution.setCode(code);
        institution.setName(name);
        institution.setType(type);
        institution.setEmailDomain(domain);
        institution.setPrimaryColor(primaryColor);
        institution.setSecondaryColor(secondaryColor);
        institution.setLat(lat);
        institution.setLng(lng);
        institution.setRadiusMeters(2000);
        institutionRepository.save(institution);

        return ResponseEntity.ok(Map.of("message", "New SaaS Tenant deployed successfully."));
    }
}