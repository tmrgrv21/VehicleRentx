package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {
    List<SupportTicket> findByOrderByIdDesc();
    List<SupportTicket> findByStatusOrderByIdDesc(String status);
    long countByStatus(String status);
}
