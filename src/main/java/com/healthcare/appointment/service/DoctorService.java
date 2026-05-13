package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.DoctorRequest;
import com.healthcare.appointment.entity.Doctor;
import com.healthcare.appointment.entity.Role;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor createDoctor(DoctorRequest request) {
        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setUser(createOrFindDoctorAccount(request, null));
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setName(request.getName());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setUser(createOrFindDoctorAccount(request, doctor.getUser()));
        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor account is not linked to a doctor profile"));
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }
        doctorRepository.deleteById(id);
    }

    private User createOrFindDoctorAccount(DoctorRequest request, User currentUser) {
        if (request.getAccountEmail() == null || request.getAccountEmail().isBlank()) {
            return currentUser;
        }

        Optional<User> existingUser = userRepository.findByEmail(request.getAccountEmail());
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(request.getName());
            user.setRole(Role.DOCTOR);
            if (request.getAccountPassword() != null && !request.getAccountPassword().isBlank()) {
                user.setPassword(request.getAccountPassword());
            }
            return userRepository.save(user);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getAccountEmail());
        user.setPassword(request.getAccountPassword() == null || request.getAccountPassword().isBlank()
                ? "123456"
                : request.getAccountPassword());
        user.setRole(Role.DOCTOR);
        return userRepository.save(user);
    }
}
