package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Integer> {
    List<SystemNotification> findByOrderByIdDesc();
}
