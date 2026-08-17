package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUserIdOrderByIdDesc(Integer userId);
    List<Booking> findByInstitutionIdOrderByIdDesc(String institutionId);
    List<Booking> findByVehicleIdAndStatusIn(Integer vehicleId, List<String> statuses);
    List<Booking> findByInstitutionIdAndBookingType(String institutionId, String bookingType);
    long countByUserId(Integer userId);
    long countByUserIdAndStatus(Integer userId, String status);
    long countByInstitutionId(String institutionId);
}