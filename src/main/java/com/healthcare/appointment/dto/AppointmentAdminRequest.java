package com.healthcare.appointment.dto;

import com.healthcare.appointment.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class AppointmentAdminRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    @NotNull
    private LocalDate examDate;

    private String symptoms;

    @NotNull
    private AppointmentStatus status;

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
