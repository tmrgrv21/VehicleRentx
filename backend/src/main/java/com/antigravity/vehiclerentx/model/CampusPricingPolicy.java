package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "campus_pricing_policies")
public class CampusPricingPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "vehicle_type")
    private String vehicleType; // bicycle, ebike, scooter, bike, car

    @Column(name = "hourly_rate")
    private Double hourlyRate = 30.0;

    @Column(name = "daily_rate")
    private Double dailyRate = 200.0;

    @Column(name = "weekly_rate")
    private Double weeklyRate = 1000.0;

    @Column(name = "security_deposit")
    private Double securityDeposit = 500.0;

    @Column(name = "late_fee_per_min")
    private Double lateFeePerMin = 2.0;

    @Column(name = "penalty_charge")
    private Double penaltyCharge = 100.0;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_percent")
    private Integer discountPercent = 0;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public Double getDailyRate() { return dailyRate; }
    public void setDailyRate(Double dailyRate) { this.dailyRate = dailyRate; }

    public Double getWeeklyRate() { return weeklyRate; }
    public void setWeeklyRate(Double weeklyRate) { this.weeklyRate = weeklyRate; }

    public Double getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(Double securityDeposit) { this.securityDeposit = securityDeposit; }

    public Double getLateFeePerMin() { return lateFeePerMin; }
    public void setLateFeePerMin(Double lateFeePerMin) { this.lateFeePerMin = lateFeePerMin; }

    public Double getPenaltyCharge() { return penaltyCharge; }
    public void setPenaltyCharge(Double penaltyCharge) { this.penaltyCharge = penaltyCharge; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
}
