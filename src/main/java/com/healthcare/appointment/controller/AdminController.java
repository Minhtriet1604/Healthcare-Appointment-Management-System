package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.AppointmentAdminRequest;
import com.healthcare.appointment.dto.DoctorRequest;
import com.healthcare.appointment.dto.PatientRequest;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.entity.Doctor;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.service.AppointmentService;
import com.healthcare.appointment.service.DoctorService;
import com.healthcare.appointment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    public AdminController(UserService userService,
                           DoctorService doctorService,
                           AppointmentService appointmentService) {
        this.userService = userService;
        this.doctorService = doctorService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/admin/summary")
    public Map<String, Long> getSummary() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        Map<String, Long> summary = new HashMap<>();
        summary.put("users", (long) userService.getAllUsers().size());
        summary.put("doctors", (long) doctorService.getAllDoctors().size());
        summary.put("appointments", (long) appointments.size());
        summary.put("pending", countByStatus(appointments, AppointmentStatus.PENDING));
        summary.put("confirmed", countByStatus(appointments, AppointmentStatus.CONFIRMED));
        summary.put("rejected", countByStatus(appointments, AppointmentStatus.REJECTED));
        summary.put("completed", countByStatus(appointments, AppointmentStatus.COMPLETED));
        summary.put("canceled", countByStatus(appointments, AppointmentStatus.CANCELED));
        return summary;
    }

    @GetMapping("/admin/users")
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/admin/patients")
    public List<User> getPatients() {
        return userService.getPatients();
    }

    @PostMapping("/admin/patients")
    public User createPatient(@Valid @RequestBody PatientRequest request) {
        return userService.createPatient(request);
    }

    @PutMapping("/admin/patients/{id}")
    public User updatePatient(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return userService.updatePatient(id, request);
    }

    @DeleteMapping("/admin/patients/{id}")
    public Map<String, String> deletePatient(@PathVariable Long id) {
        userService.deletePatient(id);
        return Map.of("message", "Patient deleted");
    }

    @GetMapping("/admin/appointments")
    public List<Appointment> getAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping("/admin/appointments")
    public Appointment createAppointment(@Valid @RequestBody AppointmentAdminRequest request) {
        return appointmentService.createAppointmentByAdmin(request);
    }

    @PutMapping("/admin/appointments/{id}")
    public Appointment updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentAdminRequest request) {
        return appointmentService.updateAppointmentByAdmin(id, request);
    }

    @DeleteMapping("/admin/appointments/{id}")
    public Map<String, String> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return Map.of("message", "Appointment deleted");
    }

    @PostMapping("/admin/doctors")
    public Doctor createDoctor(@Valid @RequestBody DoctorRequest request) {
        return doctorService.createDoctor(request);
    }

    @PutMapping("/admin/doctors/{id}")
    public Doctor updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return doctorService.updateDoctor(id, request);
    }

    @DeleteMapping("/admin/doctors/{id}")
    public Map<String, String> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return Map.of("message", "Doctor deleted");
    }

    private long countByStatus(List<Appointment> appointments, AppointmentStatus status) {
        return appointments.stream()
                .filter(appointment -> appointment.getStatus() == status)
                .count();
    }
}
