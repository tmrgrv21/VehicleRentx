package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {
    java.util.Optional<Institution> findByCode(String code);
}