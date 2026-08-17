package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Integer> {
    Optional<OTPVerification> findFirstByMobileOrderByIdDesc(String mobile);
    long countByMobileAndLastSentAtAfter(String mobile, LocalDateTime time);
}