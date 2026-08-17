package com.antigravity.vehiclerentx.repository;

import com.antigravity.vehiclerentx.model.CmsContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CmsContentRepository extends JpaRepository<CmsContent, Integer> {
    Optional<CmsContent> findBySlug(String slug);
}
