package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.EmergencyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyLogRepository extends JpaRepository<EmergencyLog, Integer> {
    List<EmergencyLog> findByInstitutionIdOrderByIdDesc(String institutionId);
}
