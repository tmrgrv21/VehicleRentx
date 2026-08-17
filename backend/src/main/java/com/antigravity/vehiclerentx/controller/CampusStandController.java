package com.antigravity.vehiclerentx.controller;

import com.antigravity.vehiclerentx.model.CampusVehicleStand;
import com.antigravity.vehiclerentx.repository.CampusVehicleStandRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stands")
public class CampusStandController {

    private final CampusVehicleStandRepository standRepository;

    public CampusStandController(CampusVehicleStandRepository standRepository) {
        this.standRepository = standRepository;
    }

    private void seedIgntuDefaultStands(String tenantId) {
        if (!"IGNTU".equalsIgnoreCase(tenantId)) return;
        List<CampusVehicleStand> existing = standRepository.findByInstitutionIdOrderByDisplayOrderAsc(tenantId);
        if (!existing.isEmpty()) return;

        // 1. University Gate
        CampusVehicleStand s1 = new CampusVehicleStand(); s1.setInstitutionId(tenantId); s1.setStandName("University Gate"); s1.setShortName("Gate"); s1.setDisplayOrder(1); s1.setLatitude(22.8015); s1.setLongitude(81.7505); s1.setCapacity(30); s1.setAvailableVehicles(8); s1.setStatus("active"); s1.setIsDefault(true);
        // 2. Girls' Hostel (GGBH)
        CampusVehicleStand s2 = new CampusVehicleStand(); s2.setInstitutionId(tenantId); s2.setStandName("Girls' Hostel (GGBH)"); s2.setShortName("GGBH"); s2.setDisplayOrder(2); s2.setLatitude(22.8030); s2.setLongitude(81.7525); s2.setCapacity(25); s2.setAvailableVehicles(6); s2.setStatus("active");
        // 3. Rani Durgavati Girls Hostel (RDGH)
        CampusVehicleStand s3 = new CampusVehicleStand(); s3.setInstitutionId(tenantId); s3.setStandName("Rani Durgavati Girls Hostel (RDGH)"); s3.setShortName("RDGH"); s3.setDisplayOrder(3); s3.setLatitude(22.8042); s3.setLongitude(81.7538); s3.setCapacity(25); s3.setAvailableVehicles(5); s3.setStatus("active");
        // 4. OBC Boys Hostel
        CampusVehicleStand s4 = new CampusVehicleStand(); s4.setInstitutionId(tenantId); s4.setStandName("OBC Boys Hostel"); s4.setShortName("OBC Hostel"); s4.setDisplayOrder(4); s4.setLatitude(22.8055); s4.setLongitude(81.7550); s4.setCapacity(25); s4.setAvailableVehicles(7); s4.setStatus("active");
        // 5. Central Library
        CampusVehicleStand s5 = new CampusVehicleStand(); s5.setInstitutionId(tenantId); s5.setStandName("Central Library"); s5.setShortName("Library"); s5.setDisplayOrder(5); s5.setLatitude(22.8068); s5.setLongitude(81.7565); s5.setCapacity(35); s5.setAvailableVehicles(12); s5.setStatus("active");
        // 6. Department of Vocational Education
        CampusVehicleStand s6 = new CampusVehicleStand(); s6.setInstitutionId(tenantId); s6.setStandName("Department of Vocational Education"); s6.setShortName("Voc Ed"); s6.setDisplayOrder(6); s6.setLatitude(22.8080); s6.setLongitude(81.7580); s6.setCapacity(20); s6.setAvailableVehicles(4); s6.setStatus("active");

        standRepository.saveAll(List.of(s1, s2, s3, s4, s5, s6));
    }

    private void seedDuDefaultStands(String tenantId) {
        if (!"DU".equalsIgnoreCase(tenantId)) return;
        List<CampusVehicleStand> existing = standRepository.findByInstitutionIdOrderByDisplayOrderAsc(tenantId);
        if (!existing.isEmpty()) return;

        // 1. St. Stephen's College
        CampusVehicleStand d1 = new CampusVehicleStand(); d1.setInstitutionId(tenantId); d1.setStandName("St. Stephen's College"); d1.setShortName("Stephen's"); d1.setDisplayOrder(1); d1.setLatitude(28.6853); d1.setLongitude(77.2117); d1.setCapacity(35); d1.setAvailableVehicles(10); d1.setStatus("active"); d1.setIsDefault(true);
        // 2. Hindu College
        CampusVehicleStand d2 = new CampusVehicleStand(); d2.setInstitutionId(tenantId); d2.setStandName("Hindu College"); d2.setShortName("Hindu"); d2.setDisplayOrder(2); d2.setLatitude(28.6841); d2.setLongitude(77.2104); d2.setCapacity(35); d2.setAvailableVehicles(8); d2.setStatus("active");
        // 3. Shri Ram College of Commerce (SRCC)
        CampusVehicleStand d3 = new CampusVehicleStand(); d3.setInstitutionId(tenantId); d3.setStandName("Shri Ram College of Commerce (SRCC)"); d3.setShortName("SRCC"); d3.setDisplayOrder(3); d3.setLatitude(28.6882); d3.setLongitude(77.2098); d3.setCapacity(40); d3.setAvailableVehicles(14); d3.setStatus("active");
        // 4. Lady Shri Ram College for Women (LSR)
        CampusVehicleStand d4 = new CampusVehicleStand(); d4.setInstitutionId(tenantId); d4.setStandName("Lady Shri Ram College for Women (LSR)"); d4.setShortName("LSR"); d4.setDisplayOrder(4); d4.setLatitude(28.5606); d4.setLongitude(77.2396); d4.setCapacity(30); d4.setAvailableVehicles(9); d4.setStatus("active");
        // 5. Hansraj College
        CampusVehicleStand d5 = new CampusVehicleStand(); d5.setInstitutionId(tenantId); d5.setStandName("Hansraj College"); d5.setShortName("Hansraj"); d5.setDisplayOrder(5); d5.setLatitude(28.6797); d5.setLongitude(77.2109); d5.setCapacity(35); d5.setAvailableVehicles(11); d5.setStatus("active");
        // 6. Miranda House
        CampusVehicleStand d6 = new CampusVehicleStand(); d6.setInstitutionId(tenantId); d6.setStandName("Miranda House"); d6.setShortName("Miranda"); d6.setDisplayOrder(6); d6.setLatitude(28.6877); d6.setLongitude(77.2062); d6.setCapacity(30); d6.setAvailableVehicles(7); d6.setStatus("active");
        // 7. Kirori Mal College
        CampusVehicleStand d7 = new CampusVehicleStand(); d7.setInstitutionId(tenantId); d7.setStandName("Kirori Mal College"); d7.setShortName("KMC"); d7.setDisplayOrder(7); d7.setLatitude(28.6835); d7.setLongitude(77.2081); d7.setCapacity(35); d7.setAvailableVehicles(12); d7.setStatus("active");
        // 8. Ramjas College
        CampusVehicleStand d8 = new CampusVehicleStand(); d8.setInstitutionId(tenantId); d8.setStandName("Ramjas College"); d8.setShortName("Ramjas"); d8.setDisplayOrder(8); d8.setLatitude(28.6828); d8.setLongitude(77.2045); d8.setCapacity(30); d8.setAvailableVehicles(6); d8.setStatus("active");
        // 9. Jesus and Mary College
        CampusVehicleStand d9 = new CampusVehicleStand(); d9.setInstitutionId(tenantId); d9.setStandName("Jesus and Mary College"); d9.setShortName("JMC"); d9.setDisplayOrder(9); d9.setLatitude(28.5836); d9.setLongitude(77.1802); d9.setCapacity(25); d9.setAvailableVehicles(5); d9.setStatus("active");
        // 10. Sri Venkateswara College
        CampusVehicleStand d10 = new CampusVehicleStand(); d10.setInstitutionId(tenantId); d10.setStandName("Sri Venkateswara College"); d10.setShortName("Venky"); d10.setDisplayOrder(10); d10.setLatitude(28.5878); d10.setLongitude(77.1685); d10.setCapacity(30); d10.setAvailableVehicles(8); d10.setStatus("active");

        standRepository.saveAll(List.of(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10));
    }

    @GetMapping
    public ResponseEntity<?> getActiveStands(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        seedIgntuDefaultStands(tenantId);
        seedDuDefaultStands(tenantId);
        List<CampusVehicleStand> stands = standRepository.findByInstitutionIdAndStatusOrderByDisplayOrderAsc(tenantId, "active");
        return ResponseEntity.ok(stands);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllStands(@RequestParam(name = "institutionId", defaultValue = "IGNTU") String tenantId) {
        seedIgntuDefaultStands(tenantId);
        seedDuDefaultStands(tenantId);
        List<CampusVehicleStand> stands = standRepository.findByInstitutionIdOrderByDisplayOrderAsc(tenantId);
        return ResponseEntity.ok(stands);
    }
}
