package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.AiFraudFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiFraudFlagRepository extends JpaRepository<AiFraudFlag, Integer> {
    List<AiFraudFlag> findByOrderByIdDesc();
    List<AiFraudFlag> findByStatusOrderByIdDesc(String status);
}
