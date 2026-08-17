package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.CampusVehicleStand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampusVehicleStandRepository extends JpaRepository<CampusVehicleStand, Integer> {
    List<CampusVehicleStand> findByInstitutionIdOrderByDisplayOrderAsc(String institutionId);
    List<CampusVehicleStand> findByInstitutionIdAndStatusOrderByDisplayOrderAsc(String institutionId, String status);
}
