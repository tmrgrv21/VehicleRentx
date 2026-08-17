package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByUserIdOrderByIdDesc(Integer userId);
    List<Payment> findByInstitutionIdOrderByIdDesc(String institutionId);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.type = 'ride_payment'")
    Double sumTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.institutionId = ?1 AND p.type = 'ride_payment'")
    Double sumRevenueByInstitution(String institutionId);
}