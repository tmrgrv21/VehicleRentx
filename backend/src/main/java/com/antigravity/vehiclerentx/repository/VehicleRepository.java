package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByInstitutionId(String institutionId);
    List<Vehicle> findByInstitutionIdOrderByIdDesc(String institutionId);
    java.util.Optional<Vehicle> findByPlateNumber(String plateNumber);
}