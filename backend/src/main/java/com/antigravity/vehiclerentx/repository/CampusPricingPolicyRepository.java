package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.CampusPricingPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CampusPricingPolicyRepository extends JpaRepository<CampusPricingPolicy, Integer> {
    List<CampusPricingPolicy> findByInstitutionId(String institutionId);
    Optional<CampusPricingPolicy> findByInstitutionIdAndVehicleType(String institutionId, String vehicleType);
}
