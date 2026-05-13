package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.AppointmentRequest;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@Valid @RequestBody AppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    @GetMapping("/appointments/patient/{id}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long id) {
        return appointmentService.getAppointmentsByPatient(id);
    }

    @GetMapping("/appointments/doctor/{id}")
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Long id) {
        return appointmentService.getAppointmentsByDoctor(id);
    }

    @PutMapping("/appointments/{id}/confirm")
    public Appointment confirmAppointment(@PathVariable Long id) {
        return appointmentService.confirmAppointment(id);
    }

    @PutMapping("/appointments/{id}/reject")
    public Appointment rejectAppointment(@PathVariable Long id) {
        return appointmentService.rejectAppointment(id);
    }
}
