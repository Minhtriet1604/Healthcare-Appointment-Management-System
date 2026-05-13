package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentRequest;
import com.healthcare.appointment.dto.AppointmentAdminRequest;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.entity.Doctor;
import com.healthcare.appointment.entity.Role;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    public Appointment createAppointment(AppointmentRequest request) {
        User patient = findOrCreatePatient(request);
        Doctor doctor = findDoctorForRequest(request);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setExamDate(request.getExamDate());
        appointment.setSymptoms(request.getSymptoms());
        appointment.setStatus(AppointmentStatus.PENDING);

        return appointmentRepository.save(appointment);
    }

    public Appointment createAppointmentByAdmin(AppointmentAdminRequest request) {
        Appointment appointment = new Appointment();
        applyAdminRequest(appointment, request);
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointmentByAdmin(Long appointmentId, AppointmentAdminRequest request) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);
        applyAdminRequest(appointment, request);
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new RuntimeException("Appointment not found");
        }
        appointmentRepository.deleteById(appointmentId);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment confirmAppointment(Long appointmentId) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentRepository.save(appointment);
    }

    public Appointment rejectAppointment(Long appointmentId) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);
        appointment.setStatus(AppointmentStatus.REJECTED);
        return appointmentRepository.save(appointment);
    }

    private void applyAdminRequest(Appointment appointment, AppointmentAdminRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new RuntimeException("Selected user is not a patient");
        }

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setExamDate(request.getExamDate());
        appointment.setSymptoms(request.getSymptoms());
        appointment.setStatus(request.getStatus());
    }

    private User findOrCreatePatient(AppointmentRequest request) {
        if (request.getPatientId() != null) {
            return userRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
        }

        return userRepository.findByEmail(request.getEmail())
                .map(existingUser -> updatePatientInfo(existingUser, request))
                .orElseGet(() -> createPatientFromAppointment(request));
    }

    private User updatePatientInfo(User user, AppointmentRequest request) {
        user.setName(request.getPatientName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setPhone(request.getPhone());
        return userRepository.save(user);
    }

    private User createPatientFromAppointment(AppointmentRequest request) {
        User patient = new User();
        patient.setName(request.getPatientName());
        patient.setEmail(request.getEmail());
        patient.setPassword("123456");
        patient.setRole(Role.PATIENT);
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        return userRepository.save(patient);
    }

    private Doctor findDoctorForRequest(AppointmentRequest request) {
        if (request.getDoctorId() != null) {
            return doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
        }

        return doctorRepository.findFirstBySpecialtyIgnoreCase(request.getSpecialty())
                .orElseThrow(() -> new RuntimeException("No doctor found for specialty: " + request.getSpecialty()));
    }

    private Appointment getAppointmentOrThrow(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}
