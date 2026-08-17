package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findTop100ByOrderByIdDesc();
    List<AuditLog> findByInstitutionIdOrderByIdDesc(String institutionId);
    List<AuditLog> findByTargetModuleOrderByIdDesc(String targetModule);
}
