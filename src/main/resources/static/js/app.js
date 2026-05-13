const API_BASE_URL = "";

const doctorSelect = document.getElementById("doctorId");
const doctorList = document.getElementById("doctorList");
const appointmentForm = document.getElementById("appointmentForm");
const formMessage = document.getElementById("formMessage");
const lookupType = document.getElementById("lookupType");
const lookupId = document.getElementById("lookupId");
const lookupButton = document.getElementById("lookupButton");
const appointmentList = document.getElementById("appointmentList");

let doctors = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDoctors();
});

appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedDoctor = doctors.find((doctor) => doctor.id === Number(doctorSelect.value));
    const requestBody = {
        patientName: document.getElementById("patientName").value,
        dateOfBirth: document.getElementById("dateOfBirth").value,
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        doctorId: selectedDoctor.id,
        specialty: selectedDoctor.specialty,
        examDate: document.getElementById("examDate").value,
        symptoms: document.getElementById("symptoms").value
    };

    try {
        const appointment = await apiFetch("/appointments", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestBody)
        });

        showMessage(`Đặt lịch thành công. Mã lịch hẹn: ${appointment.id}, trạng thái: ${appointment.status}`, "success");
        appointmentForm.reset();
    } catch (error) {
        showMessage(error.message, "danger");
    }
});

lookupButton.addEventListener("click", () => {
    loadAppointments();
});

async function loadDoctors() {
    try {
        doctors = await apiFetch("/doctors");
        renderDoctorOptions();
        renderDoctorList();
    } catch (error) {
        doctorList.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        doctorSelect.innerHTML = `<option value="">Không tải được bác sĩ</option>`;
    }
}

function renderDoctorOptions() {
    doctorSelect.innerHTML = `<option value="">Chọn bác sĩ</option>`;

    doctors.forEach((doctor) => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = `${doctor.specialty} - ${doctor.name}`;
        doctorSelect.appendChild(option);
    });
}

function renderDoctorList() {
    if (doctors.length === 0) {
        doctorList.innerHTML = `<p class="text-muted mb-0">Chưa có bác sĩ trong hệ thống.</p>`;
        return;
    }

    doctorList.innerHTML = doctors.map((doctor) => `
        <div class="doctor-item">
            <h3 class="h6 mb-1">${doctor.name}</h3>
            <p class="text-muted mb-0">Khoa: ${doctor.specialty} | ID: ${doctor.id}</p>
        </div>
    `).join("");
}

async function loadAppointments() {
    const id = lookupId.value;

    if (!id) {
        appointmentList.innerHTML = `<div class="alert alert-warning">Vui lòng nhập ID.</div>`;
        return;
    }

    const path = lookupType.value === "patient"
        ? `/appointments/patient/${id}`
        : `/appointments/doctor/${id}`;

    try {
        const appointments = await apiFetch(path);
        renderAppointments(appointments);
    } catch (error) {
        appointmentList.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

function renderAppointments(appointments) {
    if (appointments.length === 0) {
        appointmentList.innerHTML = `<p class="text-muted mb-0">Không có lịch hẹn.</p>`;
        return;
    }

    appointmentList.innerHTML = appointments.map((appointment) => `
        <div class="appointment-item">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                    <h3 class="h6 mb-1">${appointment.patient.name}</h3>
                    <p class="text-muted mb-0">${appointment.doctor.name} - ${appointment.doctor.specialty}</p>
                </div>
                <span class="badge badge-status ${statusClass(appointment.status)}">${appointment.status}</span>
            </div>
            <p class="mb-1"><strong>Ngày khám:</strong> ${appointment.examDate}</p>
            <p class="mb-3"><strong>Triệu chứng:</strong> ${appointment.symptoms}</p>
            <div class="appointment-actions">
                <button class="btn btn-success btn-sm" onclick="updateStatus(${appointment.id}, 'confirm')">Xác nhận</button>
                <button class="btn btn-danger btn-sm" onclick="updateStatus(${appointment.id}, 'reject')">Từ chối</button>
            </div>
        </div>
    `).join("");
}

async function updateStatus(appointmentId, action) {
    try {
        await apiFetch(`/appointments/${appointmentId}/${action}`, {method: "PUT"});
        await loadAppointments();
    } catch (error) {
        appointmentList.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi gọi API.");
    }

    return data;
}

function statusClass(status) {
    if (status === "CONFIRMED") {
        return "text-bg-success";
    }

    if (status === "REJECTED") {
        return "text-bg-danger";
    }

    return "text-bg-warning";
}

function showMessage(message, type) {
    formMessage.className = `alert alert-${type} mt-3`;
    formMessage.textContent = message;
}
