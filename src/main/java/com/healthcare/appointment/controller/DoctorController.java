package com.healthcare.appointment.controller;

import com.healthcare.appointment.entity.Doctor;
import com.healthcare.appointment.service.DoctorService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/doctors/account/{userId}")
    public Doctor getDoctorByUserAccount(@PathVariable Long userId) {
        return doctorService.getDoctorByUserId(userId);
    }
}
