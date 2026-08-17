package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "institution_id")
    private String institutionId;
    @Column(name = "owner_id")
    private Integer ownerId;
    
    private String name;
    private String type;
    private String model;
    
    @Column(name = "plate_number")
    private String plateNumber;
    private String status = "available";
    private Double lat;
    private Double lng;
    
    @Column(name = "battery_level")
    private Integer batteryLevel = 100;
    @Column(name = "range_km")
    private Integer rangeKm = 80;
    @Column(name = "check_in_odometer")
    private Integer checkInOdometer = 0;
    @Column(name = "health_index")
    private Integer healthIndex = 100;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public Integer getOwnerId() { return ownerId; }
    public void setOwnerId(Integer ownerId) { this.ownerId = ownerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }

    public Integer getRangeKm() { return rangeKm; }
    public void setRangeKm(Integer rangeKm) { this.rangeKm = rangeKm; }

    public Integer getCheckInOdometer() { return checkInOdometer; }
    public void setCheckInOdometer(Integer checkInOdometer) { this.checkInOdometer = checkInOdometer; }

    public Integer getHealthIndex() { return healthIndex; }
    public void setHealthIndex(Integer healthIndex) { this.healthIndex = healthIndex; }
}