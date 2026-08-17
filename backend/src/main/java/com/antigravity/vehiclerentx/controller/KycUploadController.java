package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.User;
import com.antigravity.vehiclerentx.repository.UserRepository;
import com.antigravity.vehiclerentx.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class KycUploadController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private static final String UPLOAD_DIR = "uploads";

    public KycUploadController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/auth/kyc/upload")
    public ResponseEntity<Map<String, Object>> uploadKycFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Integer userId,
            @RequestParam("docType") String docType,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        String token = extractToken(request);
        if (token == null || jwtService.verifyToken(token) == null) {
            response.put("error", "Unauthorized upload. Please log in first.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        User user = userOpt.get();

        List<String> allowedDocTypes = Arrays.asList("aadhaar_front", "aadhaar_back", "dl_front", "dl_back", "selfie");
        if (!allowedDocTypes.contains(docType)) {
            response.put("error", "Invalid document type selector.");
            return ResponseEntity.badRequest().body(response);
        }

        if (file.isEmpty()) {
            response.put("error", "No file selected or uploaded.");
            return ResponseEntity.badRequest().body(response);
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            response.put("error", "File size exceeds maximum limit of 10MB.");
            return ResponseEntity.badRequest().body(response);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            response.put("error", "Unsupported file type. Only JPG, PNG, WEBP images are accepted.");
            return ResponseEntity.badRequest().body(response);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "jpg";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }
        
        if (!Arrays.asList("jpg", "jpeg", "png", "webp").contains(extension)) {
            response.put("error", "Invalid file extension. Only JPG, JPEG, PNG, WEBP are allowed.");
            return ResponseEntity.badRequest().body(response);
        }

        String targetFilename = UUID.randomUUID().toString() + "_" + docType + "." + extension;

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            Path filePath = Paths.get(UPLOAD_DIR, targetFilename);
            Files.write(filePath, file.getBytes());

            String viewUrl = "/api/auth/kyc/view/" + targetFilename;
            switch (docType) {
                case "aadhaar_front":
                    user.setKycAadhaarFront(viewUrl);
                    break;
                case "aadhaar_back":
                    user.setKycAadhaarBack(viewUrl);
                    break;
                case "dl_front":
                    user.setKycDlFront(viewUrl);
                    break;
                case "dl_back":
                    user.setKycDlBack(viewUrl);
                    break;
                case "selfie":
                    user.setKycSelfie(viewUrl);
                    break;
            }

            if ("selfie".equals(docType)) {
                user.setKycSelfieUrl(viewUrl);
            }

            user.setKycUploadedAt(LocalDateTime.now());
            userRepository.save(user);

            response.put("message", "Document uploaded successfully!");
            response.put("fileName", targetFilename);
            response.put("url", viewUrl);
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("error", "Server storage error: failed to write file.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/auth/kyc/view/{filename:.+}")
    public ResponseEntity<byte[]> viewKycFile(@PathVariable String filename, HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || jwtService.verifyToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Path filePath = Paths.get(UPLOAD_DIR, filename);
            File file = filePath.toFile();
            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            byte[] imageBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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