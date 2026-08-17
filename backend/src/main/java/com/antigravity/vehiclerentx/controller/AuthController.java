package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import com.antigravity.vehiclerentx.service.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;
    private final OTPVerificationRepository otpRepository;
    private final InstitutionRepository institutionRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NoticeRepository noticeRepository;
    private final SmsService smsService;
    private final JwtService jwtService;

    @Value("${jwt.secret:vrx_super_secret_jwt_key_2026}")
    private String jwtSecret;

    @Value("${paypal.client-id:test}")
    private String paypalClientId;

    public AuthController(UserRepository userRepository, OTPVerificationRepository otpRepository,
                          InstitutionRepository institutionRepository, BookingRepository bookingRepository,
                          PaymentRepository paymentRepository, NoticeRepository noticeRepository,
                          SmsService smsService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.institutionRepository = institutionRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.noticeRepository = noticeRepository;
        this.smsService = smsService;
        this.jwtService = jwtService;
    }

    @PostMapping({"/auth/send-otp", "/auth/register/otp/send"})
    public ResponseEntity<Map<String, Object>> sendOTP(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String phone = body.get("phone");
        Map<String, Object> response = new HashMap<>();

        if (phone == null || !phone.matches("^(\\+91|91)?[6-9]\\d{9}$")) {
            response.put("error", "Invalid mobile format. Must be a valid 10-digit Indian mobile number.");
            return ResponseEntity.badRequest().body(response);
        }

        if (phone.length() == 10) {
            phone = "+91" + phone;
        } else if (phone.startsWith("91") && phone.length() == 12) {
            phone = "+" + phone;
        }

        if (userRepository.existsByMobile(phone)) {
            response.put("error", "This mobile number is already registered.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<OTPVerification> existingOpt = otpRepository.findFirstByMobileOrderByIdDesc(phone);
        if (existingOpt.isPresent()) {
            OTPVerification ver = existingOpt.get();
            
            if (ver.getAttemptCount() >= 5) {
                long minutesPassed = ChronoUnit.MINUTES.between(ver.getLastSentAt(), LocalDateTime.now());
                if (minutesPassed < 30) {
                    response.put("error", "Too many failed attempts. Verification is locked. Please try again after " + (30 - minutesPassed) + " minutes.");
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
                } else {
                    ver.setAttemptCount(0);
                    otpRepository.save(ver);
                }
            }

            long secondsPassed = ChronoUnit.SECONDS.between(ver.getLastSentAt(), LocalDateTime.now());
            if (secondsPassed < 60) {
                response.put("error", "Please wait 60 seconds before requesting a new OTP.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
            }
        }

        long hourlyCount = otpRepository.countByMobileAndLastSentAtAfter(phone, LocalDateTime.now().minusHours(1));
        if (hourlyCount >= 5) {
            response.put("error", "Hourly request limit exceeded. Maximum 5 OTP requests allowed per hour.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }

        SecureRandom random = new SecureRandom();
        String otpCode = String.format("%06d", random.nextInt(1000000));

        Map<String, Object> smsRes = smsService.sendOTP(phone, otpCode);
        if (!(boolean) smsRes.get("success")) {
            String gatewayErr = (String) smsRes.get("error");
            response.put("error", gatewayErr);
            response.put("details", Map.of("otp", otpCode));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String otpHash = BCrypt.hashpw(otpCode, BCrypt.gensalt());
        OTPVerification verificationRecord = existingOpt.orElse(new OTPVerification());
        verificationRecord.setMobile(phone);
        verificationRecord.setOtpHash(otpHash);
        verificationRecord.setOtpCreatedAt(LocalDateTime.now());
        verificationRecord.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        verificationRecord.setLastSentAt(LocalDateTime.now());
        verificationRecord.setIsVerified(false);
        verificationRecord.setIpAddress(request.getRemoteAddr());
        verificationRecord.setDeviceInfo(request.getHeader("User-Agent"));
        otpRepository.save(verificationRecord);

        response.put("message", "OTP sent successfully to " + phone.substring(0, 6) + "XXXX" + phone.substring(phone.length() - 2) + " via " + smsRes.get("provider"));
        if ("Simulator".equals(smsRes.get("provider"))) {
            response.put("details", Map.of("otp", otpCode));
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping({"/auth/resend-otp", "/auth/register/otp/resend"})
    public ResponseEntity<Map<String, Object>> resendOTP(@RequestBody Map<String, String> body, HttpServletRequest request) {
        return sendOTP(body, request);
    }

    @PostMapping({"/auth/verify-otp", "/auth/register/otp/verify"})
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String code = body.get("code");
        Map<String, Object> response = new HashMap<>();

        if (phone == null || code == null) {
            response.put("error", "Phone and 6-digit verification code are required.");
            return ResponseEntity.badRequest().body(response);
        }

        if (phone.length() == 10) {
            phone = "+91" + phone;
        } else if (phone.startsWith("91") && phone.length() == 12) {
            phone = "+" + phone;
        }

        Optional<OTPVerification> verOpt = otpRepository.findFirstByMobileOrderByIdDesc(phone);
        if (verOpt.isEmpty()) {
            response.put("error", "No pending OTP verification found.");
            return ResponseEntity.badRequest().body(response);
        }

        OTPVerification ver = verOpt.get();

        if (ver.getAttemptCount() >= 5) {
            long minutesPassed = ChronoUnit.MINUTES.between(ver.getLastSentAt(), LocalDateTime.now());
            if (minutesPassed < 30) {
                response.put("error", "Verification is locked. Please try again after " + (30 - minutesPassed) + " minutes.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
            }
        }

        ver.setAttemptCount(ver.getAttemptCount() + 1);

        if (LocalDateTime.now().isAfter(ver.getOtpExpiresAt())) {
            otpRepository.save(ver);
            response.put("error", "OTP code has expired. Please request a new one.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!BCrypt.checkpw(code, ver.getOtpHash())) {
            otpRepository.save(ver);
            int remaining = 5 - ver.getAttemptCount();
            if (remaining <= 0) {
                response.put("error", "Maximum attempts reached. Verification locked for 30 minutes.");
            } else {
                response.put("error", "Invalid verification code. Remaining attempts: " + remaining);
            }
            return ResponseEntity.badRequest().body(response);
        }

        ver.setIsVerified(true);
        ver.setAttemptCount(0);
        ver.setOtpExpiresAt(LocalDateTime.now()); 
        otpRepository.save(ver);

        response.put("message", "Mobile number verified successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body, HttpServletResponse response) {
        Map<String, Object> resMap = new HashMap<>();

        String fullName = body.get("fullName");
        String username = body.get("username");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");
        String institutionId = body.get("institutionId");
        String role = body.getOrDefault("role", "student");
        String department = body.get("department");
        String course = body.get("course");
        String yearOrSemester = body.get("yearOrSemester");
        String enrollmentNumber = body.get("enrollmentNumber");

        if (fullName == null || username == null || email == null || phone == null || password == null || institutionId == null) {
            resMap.put("error", "Required profile parameters are missing.");
            return ResponseEntity.badRequest().body(resMap);
        }

        if (phone.length() == 10) {
            phone = "+91" + phone;
        } else if (phone.startsWith("91") && phone.length() == 12) {
            phone = "+" + phone;
        }

        if (password.length() < 8 || 
            !password.matches(".*[A-Z].*") || 
            !password.matches(".*[a-z].*") || 
            !password.matches(".*[0-9].*") || 
            !password.matches(".*[^A-Za-z0-9].*")) {
            resMap.put("error", "Password must be at least 8 characters, containing uppercase, lowercase, numbers and symbols.");
            return ResponseEntity.badRequest().body(resMap);
        }

        if (userRepository.existsByUsername(username)) {
            resMap.put("error", "Username is already taken.");
            return ResponseEntity.badRequest().body(resMap);
        }
        if (userRepository.existsByEmail(email)) {
            resMap.put("error", "Email is already registered.");
            return ResponseEntity.badRequest().body(resMap);
        }

        Optional<OTPVerification> ver = otpRepository.findFirstByMobileOrderByIdDesc(phone);
        if (ver.isEmpty() || !ver.get().getIsVerified()) {
            resMap.put("error", "Mobile verification is pending. Complete OTP step first.");
            return ResponseEntity.badRequest().body(resMap);
        }

        Optional<Institution> instOpt = institutionRepository.findById(institutionId);
        if (instOpt.isEmpty()) {
            resMap.put("error", "Invalid college/institute selection.");
            return ResponseEntity.badRequest().body(resMap);
        }
        Institution institution = instOpt.get();

        if (email == null || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            resMap.put("error", "Please enter a valid email address.");
            return ResponseEntity.badRequest().body(resMap);
        }

        User user = new User();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setEmail(email);
        user.setMobile(phone);
        user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setRole(role);
        user.setInstitutionId(institutionId);
        user.setAcademicDept(department);
        user.setAcademicCourse(course);
        user.setAcademicYear(yearOrSemester);
        user.setEnrollmentNumber(enrollmentNumber);
        user.setMobileVerified(true);
        userRepository.save(user);

        otpRepository.delete(ver.get());

        String token = jwtService.generateToken(Map.of("id", user.getId(), "email", email, "role", role, "institutionId", institutionId));

        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        resMap.put("message", "Registration successful");
        resMap.put("token", token);
        resMap.put("user", Map.of(
            "_id", user.getId().toString(),
            "fullName", fullName,
            "username", username,
            "email", email,
            "role", role,
            "institutionId", institutionId,
            "walletBalance", 500.0
        ));

        return ResponseEntity.ok(resMap);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        Map<String, Object> resMap = new HashMap<>();
        String input = body.get("email") != null ? body.get("email") : (body.get("username") != null ? body.get("username") : body.get("login"));
        String password = body.get("password");

        if (input == null || password == null) {
            resMap.put("error", "Missing login identifier or password.");
            return ResponseEntity.badRequest().body(resMap);
        }

        Optional<User> userOpt = userRepository.findByEmail(input)
                .or(() -> userRepository.findByUsername(input));

        if (userOpt.isEmpty() || !BCrypt.checkpw(password, userOpt.get().getPasswordHash())) {
            resMap.put("error", "Invalid username/email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resMap);
        }

        User user = userOpt.get();

        String token = jwtService.generateToken(Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole(), "institutionId", user.getInstitutionId()));

        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        resMap.put("message", "Login successful");
        resMap.put("token", token);
        resMap.put("user", Map.of(
            "_id", user.getId().toString(),
            "fullName", user.getFullName(),
            "username", user.getUsername() != null ? user.getUsername() : "",
            "email", user.getEmail(),
            "role", user.getRole(),
            "institutionId", user.getInstitutionId(),
            "walletBalance", user.getWalletBalance(),
            "kycStatus", user.getKycStatus()
        ));

        return ResponseEntity.ok(resMap);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("accessToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @GetMapping("/auth/verify")
    public ResponseEntity<Map<String, Object>> verify(HttpServletRequest request) {
        Map<String, Object> resMap = new HashMap<>();
        String token = extractToken(request);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No session token."));
        }

        Map<String, Object> decoded = jwtService.verifyToken(token);
        if (decoded == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Session signature invalid."));
        }

        Integer id = (Integer) decoded.get("id");
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        resMap.put("user", Map.of(
            "_id", user.getId().toString(),
            "fullName", user.getFullName(),
            "username", user.getUsername() != null ? user.getUsername() : "",
            "email", user.getEmail(),
            "role", user.getRole(),
            "institutionId", user.getInstitutionId(),
            "walletBalance", user.getWalletBalance(),
            "kycStatus", user.getKycStatus()
        ));

        return ResponseEntity.ok(resMap);
    }

    @PostMapping("/auth/kyc/submit")
    public ResponseEntity<Map<String, Object>> submitKYC(@RequestBody Map<String, String> body) {
        String userIdStr = body.get("userId");
        String aadhaar = body.get("aadhaarNumber");
        String dl = body.get("dlNumber");
        String selfieUrl = body.get("selfieUrl");

        if (userIdStr == null || aadhaar == null || dl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aadhaar and DL parameters are required."));
        }

        Optional<User> userOpt = userRepository.findById(Integer.parseInt(userIdStr));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        user.setKycStatus("pending");
        user.setKycAadhaar(aadhaar);
        user.setKycDl(dl);
        user.setKycSelfieUrl(selfieUrl != null ? selfieUrl : "");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "KYC submitted successfully", "kyc", Map.of("status", "pending")));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable("userId") Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }
        User user = userOpt.get();

        Optional<Institution> instOpt = institutionRepository.findById(user.getInstitutionId());
        Institution institution = instOpt.orElse(null);

        long totalCount = bookingRepository.countByUserId(userId);
        long completedCount = bookingRepository.countByUserIdAndStatus(userId, "completed");

        List<Notice> notices = noticeRepository.findByInstitutionIdOrderByIdDesc(user.getInstitutionId());

        Map<String, Object> resMap = new HashMap<>();
        Map<String, Object> uDetails = new HashMap<>();
        uDetails.put("_id", user.getId().toString());
        uDetails.put("fullName", user.getFullName());
        uDetails.put("username", user.getUsername() != null ? user.getUsername() : "");
        uDetails.put("email", user.getEmail());
        uDetails.put("role", user.getRole());
        uDetails.put("institutionId", user.getInstitutionId());
        uDetails.put("walletBalance", user.getWalletBalance());
        uDetails.put("trustScore", user.getTrustScore());
        uDetails.put("kycStatus", user.getKycStatus());
        uDetails.put("payoutPaypalEmail", user.getPayoutPaypalEmail() != null ? user.getPayoutPaypalEmail() : "");
        Map<String, String> kycMap = new HashMap<>();
        kycMap.put("status", user.getKycStatus());
        kycMap.put("aadhaarNumber", user.getKycAadhaar() != null ? user.getKycAadhaar() : "");
        kycMap.put("dlNumber", user.getKycDl() != null ? user.getKycDl() : "");
        kycMap.put("selfieUrl", user.getKycSelfieUrl() != null ? user.getKycSelfieUrl() : "");
        kycMap.put("aadhaarFront", user.getKycAadhaarFront() != null ? user.getKycAadhaarFront() : "");
        kycMap.put("aadhaarBack", user.getKycAadhaarBack() != null ? user.getKycAadhaarBack() : "");
        kycMap.put("dlFront", user.getKycDlFront() != null ? user.getKycDlFront() : "");
        kycMap.put("dlBack", user.getKycDlBack() != null ? user.getKycDlBack() : "");
        kycMap.put("selfie", user.getKycSelfie() != null ? user.getKycSelfie() : "");
        uDetails.put("kyc", kycMap);
        uDetails.put("academicDetails", Map.of(
            "department", user.getAcademicDept() != null ? user.getAcademicDept() : "",
            "course", user.getAcademicCourse() != null ? user.getAcademicCourse() : "",
            "yearOrSemester", user.getAcademicYear() != null ? user.getAcademicYear() : "",
            "enrollmentNumber", user.getEnrollmentNumber() != null ? user.getEnrollmentNumber() : ""
        ));
        resMap.put("user", uDetails);

        resMap.put("stats", Map.of(
            "totalRides", totalCount,
            "completedRides", completedCount
        ));

        if (institution != null) {
            resMap.put("institution", Map.of(
                "code", institution.getCode(),
                "name", institution.getName(),
                "type", institution.getType(),
                "announcements", notices
            ));
            resMap.put("branding", Map.of(
                "primaryColor", institution.getPrimaryColor(),
                "secondaryColor", institution.getSecondaryColor(),
                "logoUrl", "/assets/logo.png"
            ));
        } else {
            resMap.put("institution", Map.of(
                "code", user.getInstitutionId(),
                "name", "External Campus",
                "type", "other",
                "announcements", List.of()
            ));
            resMap.put("branding", Map.of(
                "primaryColor", "#15803D",
                "secondaryColor", "#166534",
                "logoUrl", "/assets/logo.png"
            ));
        }

        return ResponseEntity.ok(resMap);
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable("userId") Integer userId, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }
        User user = userOpt.get();
        user.setPayoutPaypalEmail(body.get("payoutPaypalEmail"));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @GetMapping("/wallet/{userId}")
    public ResponseEntity<Map<String, Object>> getWallet(@PathVariable("userId") Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }
        User user = userOpt.get();
        List<Payment> payments = paymentRepository.findByUserIdOrderByIdDesc(userId);

        List<Map<String, Object>> transactions = new ArrayList<>();
        for (Payment p : payments) {
            transactions.add(Map.of(
                "_id", p.getId().toString(),
                "amount", p.getAmount(),
                "type", p.getType(),
                "paymentMethod", p.getPaymentMethod(),
                "transactionId", p.getTransactionId() != null ? p.getTransactionId() : "",
                "description", p.getDescription() != null ? p.getDescription() : "",
                "createdAt", p.getCreatedAt().toString()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "balance", user.getWalletBalance(),
            "transactions", transactions
        ));
    }

    @PostMapping("/wallet/paypal/order")
    public ResponseEntity<Map<String, Object>> createPaypalOrder(@RequestBody Map<String, Double> body) {
        Double amount = body.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount."));
        }

        Double amountUSD = Math.round((amount / 80.0) * 100.0) / 100.0;
        String mockOrderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        return ResponseEntity.ok(Map.of(
            "id", mockOrderId,
            "clientId", paypalClientId,
            "amountUSD", amountUSD
        ));
    }

    @PostMapping("/wallet/paypal/verify")
    public ResponseEntity<Map<String, Object>> verifyPaypalOrder(@RequestBody Map<String, String> body) {
        String userIdStr = body.get("userId");
        String amountStr = body.get("amount");
        String orderId = body.get("orderId");

        if (userIdStr == null || amountStr == null || orderId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing capture parameters."));
        }

        Optional<User> userOpt = userRepository.findById(Integer.parseInt(userIdStr));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        Double amount = Double.parseDouble(amountStr);
        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);

        Payment payment = new Payment();
        payment.setInstitutionId(user.getInstitutionId());
        payment.setUserId(user.getId());
        payment.setAmount(amount);
        payment.setType("topup");
        payment.setPaymentMethod("card");
        payment.setTransactionId(orderId);
        payment.setDescription("Added ₹" + amount + " via PayPal Sandboxed Checkout");
        paymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
            "balance", user.getWalletBalance(),
            "message", "₹" + amount + " successfully added via PayPal Sandbox!"
        ));
    }

    @GetMapping("/auth/institutions")
    public ResponseEntity<List<Map<String, Object>>> getInstitutions() {
        List<Institution> dbList = institutionRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        if (dbList.isEmpty()) {
            result.add(Map.of("code", "IGNTU", "name", "Indira Gandhi National Tribal University", "type", "university"));
            result.add(Map.of("code", "DU", "name", "University of Delhi", "type", "university"));
            result.add(Map.of("code", "IITD", "name", "IIT Delhi", "type", "engineering"));
            result.add(Map.of("code", "IIMA", "name", "IIM Ahmedabad", "type", "management"));
            result.add(Map.of("code", "NITT", "name", "NIT Trichy", "type", "engineering"));
        } else {
            for (Institution i : dbList) {
                result.add(Map.of("code", i.getCode(), "name", i.getName(), "type", i.getType() != null ? i.getType() : "university"));
            }
            if (result.stream().noneMatch(m -> "DU".equalsIgnoreCase((String) m.get("code")))) {
                result.add(Map.of("code", "DU", "name", "University of Delhi", "type", "university"));
            }
        }
        return ResponseEntity.ok(result);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}