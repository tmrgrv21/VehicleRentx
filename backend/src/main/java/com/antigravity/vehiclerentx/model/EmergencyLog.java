package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_logs")
public class EmergencyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_full_name")
    private String userFullName;

    @Column(name = "booking_id")
    private Integer bookingId;

    @Column(name = "sos_type")
    private String sosType = "accident"; // accident, breakdown, medical, security

    private Double lat;
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status = "alert_triggered"; // alert_triggered, dispatched, resolved

    @Column(name = "police_notified")
    private Boolean policeNotified = false;

    @Column(name = "medical_dispatched")
    private Boolean medicalDispatched = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public String getSosType() { return sosType; }
    public void setSosType(String sosType) { this.sosType = sosType; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getPoliceNotified() { return policeNotified; }
    public void setPoliceNotified(Boolean policeNotified) { this.policeNotified = policeNotified; }

    public Boolean getMedicalDispatched() { return medicalDispatched; }
    public void setMedicalDispatched(Boolean medicalDispatched) { this.medicalDispatched = medicalDispatched; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
