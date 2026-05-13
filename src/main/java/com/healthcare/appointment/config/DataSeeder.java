package com.healthcare.appointment.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.healthcare.appointment.entity.Doctor;
import com.healthcare.appointment.entity.Role;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(DoctorRepository doctorRepository, UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        normalizeUserRoleColumn();
        normalizeAppointmentStatusColumn();
        seedDoctors();
        seedUsers();
        linkDemoDoctorAccount();
    }

    private void normalizeUserRoleColumn() {
        jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL");
    }

    private void normalizeAppointmentStatusColumn() {
        jdbcTemplate.execute("ALTER TABLE appointments MODIFY COLUMN status VARCHAR(20) NOT NULL");
    }

    private void seedDoctors() {
        if (doctorRepository.count() == 0) {
            createDoctors(List.of(
                    newDoctor("Bác sĩ Nguyễn Văn A", "Răng hàm mặt"),
                    newDoctor("Bác sĩ Trần Thị B", "Thần kinh"),
                    newDoctor("Bác sĩ Lê Văn C", "Mắt"),
                    newDoctor("Bác sĩ Phạm Thị D", "Tuyến vú"),
                    newDoctor("Bác sĩ Hoàng Văn E", "Da liễu"),
                    newDoctor("Bác sĩ Nguyễn Thị F", "Ung bướu")
            ));
        }
    }

    private void seedUsers() {
        createUserIfMissing("Quản trị viên", "admin@clinic.com", "123456", Role.ADMIN);
        createUserIfMissing("Bác sĩ", "doctor@clinic.com", "123456", Role.DOCTOR);
        createUserIfMissing("Bệnh nhân", "patient@clinic.com", "123456", Role.PATIENT);
    }

    private void createDoctors(List<Doctor> doctors) {
        doctorRepository.saveAll(doctors);
    }

    private void createUserIfMissing(String name, String email, String password, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        userRepository.save(user);
    }

    private void linkDemoDoctorAccount() {
        User doctorUser = userRepository.findByEmail("doctor@clinic.com").orElse(null);
        if (doctorUser == null) {
            return;
        }

        if (doctorRepository.findByUserId(doctorUser.getId()).isPresent()) {
            return;
        }

        doctorRepository.findAll().stream().findFirst().ifPresent(doctor -> {
            doctor.setUser(doctorUser);
            doctorRepository.save(doctor);
        });
    }

    private Doctor newDoctor(String name, String specialty) {
        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setSpecialty(specialty);
        return doctor;
    }
}
