package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/institution-admin")
public class InstitutionAdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogRepository auditLogRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final CampusZoneRepository campusZoneRepository;
    private final CampusPricingPolicyRepository campusPricingPolicyRepository;
    private final VehicleMaintenanceLogRepository vehicleMaintenanceLogRepository;
    private final EmergencyLogRepository emergencyLogRepository;
    private final InstitutionSettingRepository institutionSettingRepository;
    private final SystemNotificationRepository systemNotificationRepository;
    private final AiFraudFlagRepository aiFraudFlagRepository;

    public InstitutionAdminController(UserRepository userRepository, VehicleRepository vehicleRepository,
                                       BookingRepository bookingRepository, PaymentRepository paymentRepository,
                                       InstitutionRepository institutionRepository, AuditLogRepository auditLogRepository,
                                       SupportTicketRepository supportTicketRepository, CampusZoneRepository campusZoneRepository,
                                       CampusPricingPolicyRepository campusPricingPolicyRepository,
                                       VehicleMaintenanceLogRepository vehicleMaintenanceLogRepository,
                                       EmergencyLogRepository emergencyLogRepository,
                                       InstitutionSettingRepository institutionSettingRepository,
                                       SystemNotificationRepository systemNotificationRepository,
                                       AiFraudFlagRepository aiFraudFlagRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.institutionRepository = institutionRepository;
        this.auditLogRepository = auditLogRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.campusZoneRepository = campusZoneRepository;
        this.campusPricingPolicyRepository = campusPricingPolicyRepository;
        this.vehicleMaintenanceLogRepository = vehicleMaintenanceLogRepository;
        this.emergencyLogRepository = emergencyLogRepository;
        this.institutionSettingRepository = institutionSettingRepository;
        this.systemNotificationRepository = systemNotificationRepository;
        this.aiFraudFlagRepository = aiFraudFlagRepository;
    }

    private void logAudit(String tenantId, String username, String role, String action, String targetModule, String details) {
        try {
            AuditLog log = new AuditLog();
            log.setInstitutionId(tenantId);
            log.setActorUsername(username != null ? username : "CampusAdmin");
            log.setActorRole(role != null ? role : "institution_admin");
            log.setAction(action);
            log.setTargetModule(targetModule);
            log.setIpAddress("127.0.0.1");
            log.setDeviceInfo("Campus Admin Console");
            log.setDetails(details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }

    // 1. Campus Overview KPIs (Tenant Isolated)
    @GetMapping("/kpis")
    public ResponseEntity<?> getCampusKPIs(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<User> campusUsers = userRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<Vehicle> campusVehicles = vehicleRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<Booking> campusBookings = bookingRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<Payment> campusPayments = paymentRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<EmergencyLog> emergencyLogs = emergencyLogRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<VehicleMaintenanceLog> maintenanceLogs = vehicleMaintenanceLogRepository.findByInstitutionIdOrderByIdDesc(tenantId);

        long activeStudents = campusUsers.stream().filter(u -> "student".equalsIgnoreCase(u.getRole())).count();
        long activeOwners = campusUsers.stream().filter(u -> "faculty".equalsIgnoreCase(u.getRole()) || "owner".equalsIgnoreCase(u.getRole())).count();
        long registeredVehicles = campusVehicles.size();
        long availableVehicles = campusVehicles.stream().filter(v -> "available".equalsIgnoreCase(v.getStatus())).count();
        long activeRentals = campusBookings.stream().filter(b -> "active".equalsIgnoreCase(b.getStatus())).count();
        long completedRentals = campusBookings.stream().filter(b -> "completed".equalsIgnoreCase(b.getStatus())).count();
        long pendingKyc = campusUsers.stream().filter(u -> "pending".equalsIgnoreCase(u.getKycStatus())).count();

        Double totalRev = paymentRepository.sumRevenueByInstitution(tenantId);
        if (totalRev == null) totalRev = 0.0;

        double todayRev = campusPayments.stream()
                .filter(p -> "ride_payment".equalsIgnoreCase(p.getType()) && p.getCreatedAt().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .mapToDouble(Payment::getAmount).sum();

        double monthlyRev = campusPayments.stream()
                .filter(p -> "ride_payment".equalsIgnoreCase(p.getType()) && p.getCreatedAt().getMonth() == LocalDateTime.now().getMonth())
                .mapToDouble(Payment::getAmount).sum();

        double campusWalletBalance = campusUsers.stream().mapToDouble(User::getWalletBalance).sum();
        long activeEmergencyAlerts = emergencyLogs.stream().filter(e -> "alert_triggered".equalsIgnoreCase(e.getStatus())).count();
        long activeMaintenanceAlerts = maintenanceLogs.stream().filter(m -> !"completed".equalsIgnoreCase(m.getStatus())).count();

        Optional<Institution> instOpt = institutionRepository.findByCode(tenantId);
        String campusName = instOpt.isPresent() ? instOpt.get().getName() : tenantId + " Campus";
        String campusLogo = instOpt.isPresent() ? instOpt.get().getLogoUrl() : "";

        Map<String, Object> map = new HashMap<>();
        map.put("institutionId", tenantId);
        map.put("campusName", campusName);
        map.put("campusLogo", campusLogo);
        map.put("activeStudents", activeStudents);
        map.put("activeVehicleOwners", activeOwners);
        map.put("registeredVehicles", registeredVehicles);
        map.put("availableVehicles", availableVehicles);
        map.put("activeRentals", activeRentals);
        map.put("completedRentals", completedRentals);
        map.put("pendingKyc", pendingKyc);
        map.put("todayRevenue", todayRev);
        map.put("monthlyRevenue", monthlyRev);
        map.put("totalCampusRevenue", totalRev);
        map.put("campusWalletBalance", campusWalletBalance);
        map.put("activeEmergencyAlerts", activeEmergencyAlerts);
        map.put("activeMaintenanceAlerts", activeMaintenanceAlerts);

        return ResponseEntity.ok(map);
    }

    // 2. Student Management (Tenant Scoped)
    @GetMapping("/students")
    public ResponseEntity<?> getCampusStudents(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<User> users = userRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<User> students = users.stream().filter(u -> "student".equalsIgnoreCase(u.getRole())).collect(Collectors.toList());

        if (students.isEmpty()) {
            User s1 = new User();
            s1.setFullName("Rahul Sharma");
            s1.setUsername("student_" + tenantId.toLowerCase() + "_1");
            s1.setEmail("rahul.sharma@" + tenantId.toLowerCase() + ".ac.in");
            s1.setMobile("+919812345678");
            s1.setRole("student");
            s1.setInstitutionId(tenantId);
            s1.setKycStatus("approved");
            s1.setAccountStatus("active");
            s1.setAcademicDept("Computer Science");
            s1.setAcademicCourse("B.Tech");
            s1.setEnrollmentNumber(tenantId + "-2026-01");
            s1.setWalletBalance(350.0);
            s1.setTrustScore(95);

            User s2 = new User();
            s2.setFullName("Priya Patel");
            s2.setUsername("student_" + tenantId.toLowerCase() + "_2");
            s2.setEmail("priya.patel@" + tenantId.toLowerCase() + ".ac.in");
            s2.setMobile("+919812345679");
            s2.setRole("student");
            s2.setInstitutionId(tenantId);
            s2.setKycStatus("approved");
            s2.setAccountStatus("active");
            s2.setAcademicDept("Mechanical Engg");
            s2.setAcademicCourse("M.Tech");
            s2.setEnrollmentNumber(tenantId + "-2026-02");
            s2.setWalletBalance(500.0);
            s2.setTrustScore(98);

            userRepository.saveAll(List.of(s1, s2));
            students = List.of(s1, s2);
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (User u : students) {
            Map<String, Object> m = new HashMap<>();
            m.put("_id", u.getId().toString());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("mobile", u.getMobile() != null ? u.getMobile() : "");
            m.put("academicDept", u.getAcademicDept() != null ? u.getAcademicDept() : "Computer Science");
            m.put("academicCourse", u.getAcademicCourse() != null ? u.getAcademicCourse() : "B.Tech");
            m.put("enrollmentNumber", u.getEnrollmentNumber() != null ? u.getEnrollmentNumber() : tenantId + "-2026-01");
            m.put("kycStatus", u.getKycStatus());
            m.put("accountStatus", u.getAccountStatus());
            m.put("walletBalance", u.getWalletBalance());
            m.put("trustScore", u.getTrustScore());
            output.add(m);
        }
        return ResponseEntity.ok(output);
    }

    // 3. Vehicle Owner Management (Tenant Scoped)
    @GetMapping("/owners")
    public ResponseEntity<?> getCampusOwners(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<User> users = userRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<User> owners = users.stream().filter(u -> "faculty".equalsIgnoreCase(u.getRole()) || "owner".equalsIgnoreCase(u.getRole())).collect(Collectors.toList());

        if (owners.isEmpty()) {
            User o1 = new User();
            o1.setFullName("Prof. Amit Kumar");
            o1.setUsername("faculty_" + tenantId.toLowerCase() + "_1");
            o1.setEmail("amit.kumar@" + tenantId.toLowerCase() + ".ac.in");
            o1.setMobile("+919876543210");
            o1.setRole("faculty");
            o1.setInstitutionId(tenantId);
            o1.setKycStatus("approved");
            o1.setAccountStatus("active");
            o1.setWalletBalance(1250.0);

            User o2 = new User();
            o2.setFullName("Dr. Ananya Verma");
            o2.setUsername("owner_" + tenantId.toLowerCase() + "_2");
            o2.setEmail("ananya.verma@" + tenantId.toLowerCase() + ".ac.in");
            o2.setMobile("+919876543211");
            o2.setRole("owner");
            o2.setInstitutionId(tenantId);
            o2.setKycStatus("approved");
            o2.setAccountStatus("active");
            o2.setWalletBalance(2800.0);

            userRepository.saveAll(List.of(o1, o2));
            owners = List.of(o1, o2);
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (User u : owners) {
            Map<String, Object> m = new HashMap<>();
            m.put("_id", u.getId().toString());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("mobile", u.getMobile() != null ? u.getMobile() : "");
            m.put("kycStatus", u.getKycStatus());
            m.put("accountStatus", u.getAccountStatus());
            m.put("walletBalance", u.getWalletBalance());
            output.add(m);
        }
        return ResponseEntity.ok(output);
    }

    // 4. Live GPS Ride Monitoring Stream (Tenant Scoped)
    @GetMapping("/live-rides")
    public ResponseEntity<?> getLiveRides(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<Booking> bookings = bookingRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<Booking> activeRides = bookings.stream().filter(b -> "active".equalsIgnoreCase(b.getStatus())).collect(Collectors.toList());

        List<Map<String, Object>> output = new ArrayList<>();
        for (Booking b : activeRides) {
            Optional<User> uOpt = userRepository.findById(b.getUserId());
            Optional<Vehicle> vOpt = vehicleRepository.findById(b.getVehicleId());

            Map<String, Object> m = new HashMap<>();
            m.put("bookingId", b.getId());
            m.put("riderName", uOpt.isPresent() ? uOpt.get().getFullName() : "Rider #" + b.getUserId());
            m.put("riderMobile", uOpt.isPresent() ? uOpt.get().getMobile() : "");
            m.put("vehicleModel", vOpt.isPresent() ? vOpt.get().getModel() : "Campus Bike");
            m.put("plateNumber", vOpt.isPresent() ? vOpt.get().getPlateNumber() : tenantId + "-E-101");
            m.put("lat", vOpt.isPresent() ? vOpt.get().getLat() : 22.8021);
            m.put("lng", vOpt.isPresent() ? vOpt.get().getLng() : 81.7543);
            m.put("batteryLevel", vOpt.isPresent() ? vOpt.get().getBatteryLevel() : 88);
            m.put("startTime", b.getStartTime() != null ? b.getStartTime().toString() : "");
            m.put("tripCostSoFar", b.getTotalCost() != null ? b.getTotalCost() : 20.0);
            output.add(m);
        }
        return ResponseEntity.ok(output);
    }

    // 5. Campus Staff & RBAC Management (Strictly Subordinate Staff, No Institution Admins)
    @GetMapping("/staff")
    public ResponseEntity<?> getCampusStaff(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<User> users = userRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<User> staff = users.stream().filter(u -> "staff".equalsIgnoreCase(u.getRole())).collect(Collectors.toList());
        if (staff.isEmpty()) {
            User st1 = new User();
            st1.setFullName("Officer Vikram Singh");
            st1.setUsername("staff_" + tenantId.toLowerCase() + "_1");
            st1.setEmail("vikram.singh@" + tenantId.toLowerCase() + ".ac.in");
            st1.setRole("staff");
            st1.setInstitutionId(tenantId);
            st1.setAccountStatus("active");

            userRepository.save(st1);
            staff = List.of(st1);
        }
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createCampusStaff(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId, @RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String staffRole = body.getOrDefault("staffRole", "KYC Officer");

        if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("error", "Email and Password required."));

        User staff = new User();
        staff.setFullName(fullName);
        staff.setUsername(username != null ? username : email.split("@")[0]);
        staff.setEmail(email);
        staff.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        staff.setRole("staff");
        staff.setInstitutionId(tenantId);
        staff.setAccountStatus("active");
        userRepository.save(staff);

        logAudit(tenantId, "CampusAdmin", "institution_admin", "CREATE_STAFF", "Staff Management", "Deployed campus staff " + email + " as " + staffRole);
        return ResponseEntity.ok(Map.of("message", "Campus Staff account created successfully as " + staffRole));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteCampusStaff(@PathVariable("id") Integer id, @RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        Optional<User> uOpt = userRepository.findById(id);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Staff account not found."));
        }
        User u = uOpt.get();

        if (!tenantId.equalsIgnoreCase(u.getInstitutionId()) || !"staff".equalsIgnoreCase(u.getRole())) {
            logAudit(tenantId, "CampusAdmin", "institution_admin", "UNAUTHORIZED_DELETE_ATTEMPT", "Staff Security", "Blocked attempt to delete non-staff/cross-tenant account #" + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied: You cannot modify or delete administrators or accounts from another institution."));
        }

        userRepository.delete(u);
        logAudit(tenantId, "CampusAdmin", "institution_admin", "DELETE_STAFF", "Staff Security", "Deleted staff account " + u.getEmail());
        return ResponseEntity.ok(Map.of("message", "Staff account deleted successfully."));
    }

    // Profile Management (Self Account Only)
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile(@RequestParam(name = "userId") Integer userId) {
        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Account not found."));
        User u = uOpt.get();
        return ResponseEntity.ok(Map.of(
            "_id", u.getId().toString(),
            "fullName", u.getFullName(),
            "email", u.getEmail(),
            "mobile", u.getMobile() != null ? u.getMobile() : "",
            "role", u.getRole(),
            "institutionId", u.getInstitutionId() != null ? u.getInstitutionId() : "SUPER",
            "accountStatus", u.getAccountStatus() != null ? u.getAccountStatus() : "active",
            "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : LocalDateTime.now().toString()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, String> body) {
        String idStr = body.get("userId");
        if (idStr == null) return ResponseEntity.badRequest().body(Map.of("error", "User ID required."));
        Integer userId = Integer.parseInt(idStr);

        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Account not found."));

        User u = uOpt.get();
        if (body.get("fullName") != null) u.setFullName(body.get("fullName"));
        if (body.get("mobile") != null) u.setMobile(body.get("mobile"));
        if (body.get("password") != null && !body.get("password").isBlank()) {
            u.setPasswordHash(BCrypt.hashpw(body.get("password"), BCrypt.gensalt()));
        }
        userRepository.save(u);

        logAudit(u.getInstitutionId(), u.getUsername(), u.getRole(), "UPDATE_OWN_PROFILE", "My Profile", "Updated self profile details");
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
    }

    // 6. Campus Parking Stations & Zones
    @GetMapping("/zones")
    public ResponseEntity<?> getCampusZones(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<CampusZone> zones = campusZoneRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        if (zones.isEmpty()) {
            CampusZone z1 = new CampusZone(); z1.setInstitutionId(tenantId); z1.setZoneName("Admin Block Station"); z1.setZoneType("parking_station"); z1.setLat(22.8021); z1.setLng(81.7543); z1.setCapacity(25); z1.setActiveVehiclesCount(12);
            CampusZone z2 = new CampusZone(); z2.setInstitutionId(tenantId); z2.setZoneName("Central Library Hub"); z2.setZoneType("pickup_point"); z2.setLat(22.8035); z2.setLng(81.7560); z2.setCapacity(30); z2.setActiveVehiclesCount(18);
            campusZoneRepository.saveAll(List.of(z1, z2));
            zones = List.of(z1, z2);
        }
        return ResponseEntity.ok(zones);
    }

    @PostMapping("/zones")
    public ResponseEntity<?> createCampusZone(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId, @RequestBody Map<String, Object> body) {
        CampusZone z = new CampusZone();
        z.setInstitutionId(tenantId);
        z.setZoneName((String) body.get("zoneName"));
        z.setZoneType((String) body.getOrDefault("zoneType", "parking_station"));
        z.setLat(Double.parseDouble(body.getOrDefault("lat", "22.8021").toString()));
        z.setLng(Double.parseDouble(body.getOrDefault("lng", "81.7543").toString()));
        z.setCapacity(Integer.parseInt(body.getOrDefault("capacity", "20").toString()));
        campusZoneRepository.save(z);

        logAudit(tenantId, "CampusAdmin", "institution_admin", "CREATE_ZONE", "Campus Zones", "Created zone " + z.getZoneName());
        return ResponseEntity.ok(Map.of("message", "Campus zone created successfully!"));
    }

    // 7. Campus Specific Pricing Rules
    @GetMapping("/pricing")
    public ResponseEntity<?> getCampusPricing(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<CampusPricingPolicy> policies = campusPricingPolicyRepository.findByInstitutionId(tenantId);
        if (policies.isEmpty()) {
            CampusPricingPolicy p1 = new CampusPricingPolicy(); p1.setInstitutionId(tenantId); p1.setVehicleType("scooter"); p1.setHourlyRate(25.0); p1.setDailyRate(150.0); p1.setSecurityDeposit(300.0); p1.setCouponCode("IGNTU20"); p1.setDiscountPercent(20);
            CampusPricingPolicy p2 = new CampusPricingPolicy(); p2.setInstitutionId(tenantId); p2.setVehicleType("ebike"); p2.setHourlyRate(15.0); p2.setDailyRate(90.0); p2.setSecurityDeposit(200.0); p2.setCouponCode("FREERIDE"); p2.setDiscountPercent(15);
            campusPricingPolicyRepository.saveAll(List.of(p1, p2));
            policies = List.of(p1, p2);
        }
        return ResponseEntity.ok(policies);
    }

    @PostMapping("/pricing")
    public ResponseEntity<?> updateCampusPricing(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId, @RequestBody Map<String, Object> body) {
        String type = (String) body.get("vehicleType");
        Optional<CampusPricingPolicy> pOpt = campusPricingPolicyRepository.findByInstitutionIdAndVehicleType(tenantId, type);
        CampusPricingPolicy p = pOpt.orElse(new CampusPricingPolicy());
        p.setInstitutionId(tenantId);
        p.setVehicleType(type);
        if (body.get("hourlyRate") != null) p.setHourlyRate(Double.parseDouble(body.get("hourlyRate").toString()));
        if (body.get("dailyRate") != null) p.setDailyRate(Double.parseDouble(body.get("dailyRate").toString()));
        if (body.get("securityDeposit") != null) p.setSecurityDeposit(Double.parseDouble(body.get("securityDeposit").toString()));
        if (body.get("couponCode") != null) p.setCouponCode((String) body.get("couponCode"));
        campusPricingPolicyRepository.save(p);

        logAudit(tenantId, "CampusAdmin", "institution_admin", "UPDATE_PRICING", "Pricing", "Updated pricing policy for " + type);
        return ResponseEntity.ok(Map.of("message", "Campus pricing policy updated successfully."));
    }

    // 8. Maintenance Logs (Tenant Scoped)
    @GetMapping("/maintenance")
    public ResponseEntity<?> getCampusMaintenance(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<VehicleMaintenanceLog> logs = vehicleMaintenanceLogRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        if (logs.isEmpty()) {
            VehicleMaintenanceLog m = new VehicleMaintenanceLog();
            m.setInstitutionId(tenantId);
            m.setVehicleId(1);
            m.setVehicleModel("Aether Electric Scooter");
            m.setIssueCategory("Brake Service");
            m.setDescription("Front disk brake pad replacement");
            m.setCost(450.0);
            m.setStatus("in_service");
            vehicleMaintenanceLogRepository.save(m);
            logs = List.of(m);
        }
        return ResponseEntity.ok(logs);
    }

    // 9. Emergency & SOS Control (Tenant Scoped)
    @GetMapping("/emergency")
    public ResponseEntity<?> getCampusEmergencies(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<EmergencyLog> logs = emergencyLogRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        if (logs.isEmpty()) {
            EmergencyLog e = new EmergencyLog();
            e.setInstitutionId(tenantId);
            e.setUserId(2);
            e.setUserFullName("Rahul Sharma");
            e.setBookingId(101);
            e.setSosType("breakdown");
            e.setLat(22.8021);
            e.setLng(81.7543);
            e.setDescription("Tire puncture near Gate No 2");
            e.setStatus("alert_triggered");
            e.setPoliceNotified(false);
            e.setMedicalDispatched(false);
            emergencyLogRepository.save(e);
            logs = List.of(e);
        }
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/emergency/{id}/resolve")
    public ResponseEntity<?> resolveEmergency(@PathVariable("id") Integer id, @RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        Optional<EmergencyLog> eOpt = emergencyLogRepository.findById(id);
        if (eOpt.isPresent()) {
            EmergencyLog e = eOpt.get();
            e.setStatus("resolved");
            emergencyLogRepository.save(e);
            logAudit(tenantId, "CampusAdmin", "institution_admin", "RESOLVE_EMERGENCY", "Emergency SOS", "Resolved SOS alert #" + id);
        }
        return ResponseEntity.ok(Map.of("message", "Emergency SOS alert resolved cleanly."));
    }

    // 10. Tenant Settings & Profile
    @GetMapping("/settings")
    public ResponseEntity<?> getCampusSettings(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<InstitutionSetting> list = institutionSettingRepository.findByInstitutionId(tenantId);
        if (list.isEmpty()) {
            InstitutionSetting s1 = new InstitutionSetting(); s1.setInstitutionId(tenantId); s1.setSettingKey("OPERATING_HOURS"); s1.setSettingValue("06:00 AM - 10:00 PM");
            InstitutionSetting s2 = new InstitutionSetting(); s2.setInstitutionId(tenantId); s2.setSettingKey("CAMPUS_DOMAIN"); s2.setSettingValue("igntu.ac.in");
            InstitutionSetting s3 = new InstitutionSetting(); s3.setInstitutionId(tenantId); s3.setSettingKey("EMERGENCY_HELPLINE"); s3.setSettingValue("+917400683677");
            institutionSettingRepository.saveAll(List.of(s1, s2, s3));
            list = List.of(s1, s2, s3);
        }
        return ResponseEntity.ok(list);
    }

    // 11. Tenant Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getCampusAuditLogs(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        return ResponseEntity.ok(auditLogRepository.findByInstitutionIdOrderByIdDesc(tenantId));
    }

    // 12. Live GPS Stream Data (Tenant Scoped)
    @GetMapping("/live-gps")
    public ResponseEntity<?> getLiveGpsStream(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        List<Vehicle> vehicles = vehicleRepository.findByInstitutionIdOrderByIdDesc(tenantId);
        List<Map<String, Object>> stream = new ArrayList<>();
        for (Vehicle v : vehicles) {
            stream.add(Map.of(
                "id", v.getId(),
                "name", v.getName() != null ? v.getName() : "Vehicle #" + v.getId(),
                "model", v.getModel() != null ? v.getModel() : "Campus Scooter",
                "type", v.getType() != null ? v.getType() : "scooter",
                "plateNumber", v.getPlateNumber() != null ? v.getPlateNumber() : "VRX-00" + v.getId(),
                "batteryLevel", v.getBatteryLevel() != null ? v.getBatteryLevel() : 85,
                "status", v.getStatus() != null ? v.getStatus() : "available",
                "latitude", v.getLat() != null ? v.getLat() : 22.8021,
                "longitude", v.getLng() != null ? v.getLng() : 81.7543
            ));
        }
        return ResponseEntity.ok(stream);
    }
}
