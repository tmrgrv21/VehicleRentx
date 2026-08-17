package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.CampusZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampusZoneRepository extends JpaRepository<CampusZone, Integer> {
    List<CampusZone> findByInstitutionIdOrderByIdDesc(String institutionId);
}
