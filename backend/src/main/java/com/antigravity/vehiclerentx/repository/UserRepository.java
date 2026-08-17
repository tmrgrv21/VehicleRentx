package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    java.util.List<User> findByInstitutionIdOrderByIdDesc(String institutionId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByMobile(String mobile);
}