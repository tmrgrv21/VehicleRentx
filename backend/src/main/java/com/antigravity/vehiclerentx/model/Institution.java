package com.antigravity.vehiclerentx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "institutions")
public class Institution {
    @Id
    private String code;
    private String name;
    private String type;
    @Column(name = "email_domain")
    private String emailDomain;
    @Column(name = "primary_color")
    private String primaryColor;
    @Column(name = "secondary_color")
    private String secondaryColor;
    private Double lat;
    private Double lng;
    @Column(name = "radius_meters")
    private Integer radiusMeters;
    @Column(name = "logo_url")
    private String logoUrl;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEmailDomain() { return emailDomain; }
    public void setEmailDomain(String emailDomain) { this.emailDomain = emailDomain; }

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

    public String getSecondaryColor() { return secondaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(Integer radiusMeters) { this.radiusMeters = radiusMeters; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}