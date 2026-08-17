package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campus_zones")
public class CampusZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;

    @Column(name = "zone_type")
    private String zoneType = "parking_station"; // parking_station, pickup_point, drop_point, restricted_area

    private Double lat;
    private Double lng;

    @Column(name = "radius_meters")
    private Integer radiusMeters = 50;

    private Integer capacity = 20;

    @Column(name = "active_vehicles_count")
    private Integer activeVehiclesCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getZoneType() { return zoneType; }
    public void setZoneType(String zoneType) { this.zoneType = zoneType; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(Integer radiusMeters) { this.radiusMeters = radiusMeters; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getActiveVehiclesCount() { return activeVehiclesCount; }
    public void setActiveVehiclesCount(Integer activeVehiclesCount) { this.activeVehiclesCount = activeVehiclesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
