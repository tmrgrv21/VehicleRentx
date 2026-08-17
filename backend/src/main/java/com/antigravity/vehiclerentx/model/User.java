package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name")
    private String fullName;
    @Column(unique = true)
    private String username;
    @Column(unique = true)
    private String email;
    @Column(unique = true)
    private String mobile;
    @Column(name = "password_hash")
    private String passwordHash;
    private String role;
    @Column(name = "institution_id")
    private String institutionId;
    @Column(name = "trust_score")
    private Integer trustScore = 100;
    @Column(name = "wallet_balance")
    private Double walletBalance = 500.0;
    @Column(name = "payout_paypal_email")
    private String payoutPaypalEmail;
    
    @Column(name = "academic_dept")
    private String academicDept;
    @Column(name = "academic_course")
    private String academicCourse;
    @Column(name = "academic_year")
    private String academicYear;
    @Column(name = "enrollment_number")
    private String enrollmentNumber;
    
    @Column(name = "kyc_status")
    private String kycStatus = "none";
    @Column(name = "kyc_aadhaar")
    private String kycAadhaar;
    @Column(name = "kyc_dl")
    private String kycDl;
    @Column(name = "kyc_selfie_url")
    private String kycSelfieUrl;
    
    @Column(name = "kyc_aadhaar_front")
    private String kycAadhaarFront;
    @Column(name = "kyc_aadhaar_back")
    private String kycAadhaarBack;
    @Column(name = "kyc_dl_front")
    private String kycDlFront;
    @Column(name = "kyc_dl_back")
    private String kycDlBack;
    @Column(name = "kyc_selfie")
    private String kycSelfie;
    @Column(name = "kyc_uploaded_at")
    private LocalDateTime kycUploadedAt;
    
    @Column(name = "mobile_verified")
    private Boolean mobileVerified = false;

    @Column(name = "email_verified")
    private Boolean emailVerified = true;

    @Column(name = "account_status")
    private String accountStatus = "active";

    @Column(name = "suspended_reason")
    private String suspendedReason;

    @Column(name = "failed_login_count")
    private Integer failedLoginCount = 0;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip")
    private String lastLoginIp;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public Integer getTrustScore() { return trustScore; }
    public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }

    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }

    public String getPayoutPaypalEmail() { return payoutPaypalEmail; }
    public void setPayoutPaypalEmail(String payoutPaypalEmail) { this.payoutPaypalEmail = payoutPaypalEmail; }

    public String getAcademicDept() { return academicDept; }
    public void setAcademicDept(String academicDept) { this.academicDept = academicDept; }

    public String getAcademicCourse() { return academicCourse; }
    public void setAcademicCourse(String academicCourse) { this.academicCourse = academicCourse; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public String getKycAadhaar() { return kycAadhaar; }
    public void setKycAadhaar(String kycAadhaar) { this.kycAadhaar = kycAadhaar; }

    public String getKycDl() { return kycDl; }
    public void setKycDl(String kycDl) { this.kycDl = kycDl; }

    public String getKycSelfieUrl() { return kycSelfieUrl; }
    public void setKycSelfieUrl(String kycSelfieUrl) { this.kycSelfieUrl = kycSelfieUrl; }

    public String getKycAadhaarFront() { return kycAadhaarFront; }
    public void setKycAadhaarFront(String kycAadhaarFront) { this.kycAadhaarFront = kycAadhaarFront; }

    public String getKycAadhaarBack() { return kycAadhaarBack; }
    public void setKycAadhaarBack(String kycAadhaarBack) { this.kycAadhaarBack = kycAadhaarBack; }

    public String getKycDlFront() { return kycDlFront; }
    public void setKycDlFront(String kycDlFront) { this.kycDlFront = kycDlFront; }

    public String getKycDlBack() { return kycDlBack; }
    public void setKycDlBack(String kycDlBack) { this.kycDlBack = kycDlBack; }

    public String getKycSelfie() { return kycSelfie; }
    public void setKycSelfie(String kycSelfie) { this.kycSelfie = kycSelfie; }

    public LocalDateTime getKycUploadedAt() { return kycUploadedAt; }
    public void setKycUploadedAt(LocalDateTime kycUploadedAt) { this.kycUploadedAt = kycUploadedAt; }

    public Boolean getMobileVerified() { return mobileVerified; }
    public void setMobileVerified(Boolean mobileVerified) { this.mobileVerified = mobileVerified; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getAccountStatus() { return accountStatus != null ? accountStatus : "active"; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }

    public Integer getFailedLoginCount() { return failedLoginCount != null ? failedLoginCount : 0; }
    public void setFailedLoginCount(Integer failedLoginCount) { this.failedLoginCount = failedLoginCount; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}