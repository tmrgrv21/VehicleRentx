package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "database_backup_logs")
public class DatabaseBackupLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "backup_file_name")
    private String backupFileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "backup_type")
    private String backupType = "manual";

    private String status = "completed";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getBackupFileName() { return backupFileName; }
    public void setBackupFileName(String backupFileName) { this.backupFileName = backupFileName; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getBackupType() { return backupType; }
    public void setBackupType(String backupType) { this.backupType = backupType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
