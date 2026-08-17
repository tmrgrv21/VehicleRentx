package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.DatabaseBackupLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DatabaseBackupLogRepository extends JpaRepository<DatabaseBackupLog, Integer> {
    List<DatabaseBackupLog> findByOrderByIdDesc();
}
