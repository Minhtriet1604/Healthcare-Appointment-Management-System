package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.LoginRequest;
import com.healthcare.appointment.dto.PatientRequest;
import com.healthcare.appointment.dto.RegisterRequest;
import com.healthcare.appointment.entity.Role;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public UserService(UserRepository userRepository,
                       DoctorRepository doctorRepository,
                       AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // For learning projects only. In real systems, store hashed passwords.
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        doctorRepository.findByUserId(user.getId())
                .ifPresent(doctor -> user.setDoctorId(doctor.getId()));

        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getPatients() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.PATIENT)
                .toList();
    }

    public User createPatient(PatientRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User patient = new User();
        applyPatientRequest(patient, request);
        patient.setPassword(request.getPassword() == null || request.getPassword().isBlank()
                ? "123456"
                : request.getPassword());
        patient.setRole(Role.PATIENT);
        return userRepository.save(patient);
    }

    public User updatePatient(Long id, PatientRequest request) {
        User patient = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new RuntimeException("User is not a patient");
        }

        userRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Email already exists");
                });

        applyPatientRequest(patient, request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            patient.setPassword(request.getPassword());
        }
        return userRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long id) {
        User patient = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new RuntimeException("User is not a patient");
        }

        appointmentRepository.deleteByPatientId(id);
        userRepository.deleteById(id);
    }

    private void applyPatientRequest(User patient, PatientRequest request) {
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
    }
}
