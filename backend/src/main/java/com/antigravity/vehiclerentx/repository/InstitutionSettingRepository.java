package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.InstitutionSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionSettingRepository extends JpaRepository<InstitutionSetting, Integer> {
    List<InstitutionSetting> findByInstitutionId(String institutionId);
    Optional<InstitutionSetting> findByInstitutionIdAndSettingKey(String institutionId, String settingKey);
}
