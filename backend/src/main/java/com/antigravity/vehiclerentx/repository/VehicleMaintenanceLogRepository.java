package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.VehicleMaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleMaintenanceLogRepository extends JpaRepository<VehicleMaintenanceLog, Integer> {
    List<VehicleMaintenanceLog> findByInstitutionIdOrderByIdDesc(String institutionId);
}
