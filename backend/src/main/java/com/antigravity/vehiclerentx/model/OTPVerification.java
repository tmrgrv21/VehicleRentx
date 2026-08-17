package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
public class OTPVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String mobile;
    @Column(name = "otp_hash")
    private String otpHash;
    @Column(name = "otp_created_at")
    private LocalDateTime otpCreatedAt = LocalDateTime.now();
    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;
    @Column(name = "attempt_count")
    private Integer attemptCount = 0;
    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt = LocalDateTime.now();
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    @Column(name = "ip_address")
    private String ipAddress;
    @Column(name = "device_info")
    private String deviceInfo;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public LocalDateTime getOtpCreatedAt() { return otpCreatedAt; }
    public void setOtpCreatedAt(LocalDateTime otpCreatedAt) { this.otpCreatedAt = otpCreatedAt; }

    public LocalDateTime getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }

    public LocalDateTime getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(LocalDateTime lastSentAt) { this.lastSentAt = lastSentAt; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
}