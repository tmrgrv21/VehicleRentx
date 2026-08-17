package com.antigravity.vehiclerentx.config;

import com.antigravity.vehiclerentx.model.*;
import com.antigravity.vehiclerentx.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final NoticeRepository noticeRepository;

    public DatabaseInitializer(InstitutionRepository institutionRepository, UserRepository userRepository,
                               VehicleRepository vehicleRepository, NoticeRepository noticeRepository) {
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.noticeRepository = noticeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (institutionRepository.count() == 0) {
            Institution igntu = new Institution();
            igntu.setCode("IGNTU");
            igntu.setName("Indira Gandhi National Tribal University");
            igntu.setType("central_university");
            igntu.setEmailDomain("igntu.ac.in");
            igntu.setPrimaryColor("#15803D");
            igntu.setSecondaryColor("#166534");
            igntu.setLat(22.7483);
            igntu.setLng(81.7562);
            igntu.setRadiusMeters(2000);
            institutionRepository.save(igntu);

            Institution jnu = new Institution();
            jnu.setCode("JNU");
            jnu.setName("Jawaharlal Nehru University");
            jnu.setType("central_university");
            jnu.setEmailDomain("jnu.ac.in");
            jnu.setPrimaryColor("#B91C1C");
            jnu.setSecondaryColor("#991B1B");
            jnu.setLat(28.5385);
            jnu.setLng(77.1623);
            jnu.setRadiusMeters(3000);
            institutionRepository.save(jnu);

            Institution du = new Institution();
            du.setCode("DU");
            du.setName("University of Delhi");
            du.setType("central_university");
            du.setEmailDomain("du.ac.in");
            du.setPrimaryColor("#6D28D9");
            du.setSecondaryColor("#5B21B6");
            du.setLat(28.6863);
            du.setLng(77.2131);
            du.setRadiusMeters(4000);
            institutionRepository.save(du);

            Institution nitt = new Institution();
            nitt.setCode("NITT");
            nitt.setName("National Institute of Technology, Trichy");
            nitt.setType("nit");
            nitt.setEmailDomain("nitt.edu");
            nitt.setPrimaryColor("#0369A1");
            nitt.setSecondaryColor("#075985");
            nitt.setLat(10.7589);
            nitt.setLng(78.8132);
            nitt.setRadiusMeters(2500);
            institutionRepository.save(nitt);

            Institution iima = new Institution();
            iima.setCode("IIMA");
            iima.setName("Indian Institute of Management, Ahmedabad");
            iima.setType("iim");
            iima.setEmailDomain("iima.ac.in");
            iima.setPrimaryColor("#C2410C");
            iima.setSecondaryColor("#9A3412");
            iima.setLat(23.0305);
            iima.setLng(72.5350);
            iima.setRadiusMeters(1500);
            institutionRepository.save(iima);

            String superadminHash = BCrypt.hashpw("superadmin123", BCrypt.gensalt());
            String adminHash = BCrypt.hashpw("admin123", BCrypt.gensalt());
            String studentHash = BCrypt.hashpw("password123", BCrypt.gensalt());

            User superAdmin = new User();
            superAdmin.setFullName("Global Super Admin");
            superAdmin.setUsername("superadmin");
            superAdmin.setEmail("superadmin@vehiclerentx.com");
            superAdmin.setMobile("+919999999999");
            superAdmin.setPasswordHash(superadminHash);
            superAdmin.setRole("super_admin");
            superAdmin.setInstitutionId("SUPER");
            superAdmin.setMobileVerified(true);
            userRepository.save(superAdmin);

            User campusAdmin = new User();
            campusAdmin.setFullName("IGNTU Campus Administrator");
            campusAdmin.setUsername("admin_igntu");
            campusAdmin.setEmail("admin@igntu.ac.in");
            campusAdmin.setMobile("+919999999998");
            campusAdmin.setPasswordHash(adminHash);
            campusAdmin.setRole("admin");
            campusAdmin.setInstitutionId("IGNTU");
            campusAdmin.setMobileVerified(true);
            userRepository.save(campusAdmin);

            User student = new User();
            student.setFullName("Gaurav Kumar (Student)");
            student.setUsername("student_gaurav");
            student.setEmail("student@igntu.ac.in");
            student.setMobile("+919999999997");
            student.setPasswordHash(studentHash);
            student.setRole("student");
            student.setInstitutionId("IGNTU");
            student.setTrustScore(100);
            student.setWalletBalance(1000.0);
            student.setKycStatus("approved");
            student.setMobileVerified(true);
            userRepository.save(student);

            Vehicle v1 = new Vehicle();
            v1.setInstitutionId("IGNTU");
            v1.setName("Hercules Cycle #01");
            v1.setType("bicycle");
            v1.setModel("Hercules");
            v1.setPlateNumber("IGNTU-B-01");
            v1.setLat(22.7485);
            v1.setLng(81.7565);
            v1.setBatteryLevel(100);
            v1.setRangeKm(0);
            v1.setCheckInOdometer(1450);
            v1.setHealthIndex(98);
            vehicleRepository.save(v1);

            Vehicle v2 = new Vehicle();
            v2.setInstitutionId("IGNTU");
            v2.setName("Activa Electric Scooter");
            v2.setType("scooter");
            v2.setModel("Honda");
            v2.setPlateNumber("IGNTU-E-10");
            v2.setLat(22.7490);
            v2.setLng(81.7570);
            v2.setBatteryLevel(85);
            v2.setRangeKm(60);
            v2.setCheckInOdometer(2800);
            v2.setHealthIndex(92);
            vehicleRepository.save(v2);

            Vehicle v3 = new Vehicle();
            v3.setInstitutionId("IGNTU");
            v3.setName("Campus Electric Cart");
            v3.setType("scooter");
            v3.setModel("E-Cart");
            v3.setPlateNumber("IGNTU-C-05");
            v3.setLat(22.7475);
            v3.setLng(81.7558);
            v3.setBatteryLevel(92);
            v3.setRangeKm(120);
            v3.setCheckInOdometer(3450);
            v3.setHealthIndex(95);
            vehicleRepository.save(v3);

            Vehicle v4 = new Vehicle();
            v4.setInstitutionId("JNU");
            v4.setName("JNU Cycle #12");
            v4.setType("bicycle");
            v4.setModel("Atlas");
            v4.setPlateNumber("JNU-B-12");
            v4.setLat(28.5390);
            v4.setLng(77.1630);
            v4.setBatteryLevel(100);
            v4.setRangeKm(0);
            v4.setCheckInOdometer(950);
            v4.setHealthIndex(99);
            vehicleRepository.save(v4);

            Notice welcomeNotice = new Notice();
            welcomeNotice.setInstitutionId("IGNTU");
            welcomeNotice.setTitle("Welcome to Anti Gravity Campus SaaS");
            welcomeNotice.setType("notice");
            welcomeNotice.setContent("Enjoy zero carbon emission campus rentals, secured by digital KYC checks!");
            noticeRepository.save(welcomeNotice);
        }
    }
}