package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "actor_user_id")
    private Integer actorUserId;

    @Column(name = "actor_username")
    private String actorUsername;

    @Column(name = "actor_role")
    private String actorRole;

    @Column(name = "institution_id")
    private String institutionId;

    private String action;

    @Column(name = "target_module")
    private String targetModule;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_info")
    private String deviceInfo;

    private String status = "success";

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getActorUserId() { return actorUserId; }
    public void setActorUserId(Integer actorUserId) { this.actorUserId = actorUserId; }

    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTargetModule() { return targetModule; }
    public void setTargetModule(String targetModule) { this.targetModule = targetModule; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
