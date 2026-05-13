const dashboardLayout = document.getElementById("dashboardLayout");
const summaryCards = document.getElementById("summaryCards");
const appointmentDonut = document.getElementById("appointmentDonut");
const donutLegend = document.getElementById("donutLegend");
const doctorTable = document.getElementById("doctorTable");
const patientTable = document.getElementById("patientTable");
const appointmentTable = document.getElementById("appointmentTable");
const recentAppointmentTable = document.getElementById("recentAppointmentTable");
const adminMessage = document.getElementById("adminMessage");

let doctors = [];
let patients = [];
let appointments = [];

document.addEventListener("DOMContentLoaded", async () => {
    protectAdminPage();
    bindEvents();
    await loadDashboard();
});

function protectAdminPage() {
    const user = getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        window.location.href = "/";
    }
}

function bindEvents() {
    document.getElementById("logoutButton").addEventListener("click", logout);
    document.getElementById("sidebarToggle").addEventListener("click", () => dashboardLayout.classList.toggle("sidebar-collapsed"));
    document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);

    document.getElementById("doctorForm").addEventListener("submit", saveDoctor);
    document.getElementById("resetDoctorForm").addEventListener("click", resetDoctorForm);
    document.getElementById("newDoctorButton").addEventListener("click", resetDoctorForm);

    document.getElementById("patientForm").addEventListener("submit", savePatient);
    document.getElementById("resetPatientForm").addEventListener("click", resetPatientForm);
    document.getElementById("newPatientButton").addEventListener("click", resetPatientForm);

    document.getElementById("appointmentForm").addEventListener("submit", saveAppointment);
    document.getElementById("resetAppointmentForm").addEventListener("click", resetAppointmentForm);
    document.getElementById("newAppointmentButton").addEventListener("click", resetAppointmentForm);

    document.querySelectorAll(".sidebar-menu .sidebar-link").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.section, button));
    });
}

function showSection(sectionId, activeButton) {
    document.querySelectorAll(".dashboard-section").forEach((section) => section.classList.toggle("active", section.id === sectionId));
    document.querySelectorAll(".sidebar-menu .sidebar-link").forEach((button) => button.classList.toggle("active", button === activeButton));
}

async function loadDashboard() {
    try {
        const [summary, doctorData, patientData, appointmentData] = await Promise.all([
            apiFetch("/admin/summary"),
            apiFetch("/doctors"),
            apiFetch("/admin/patients"),
            apiFetch("/admin/appointments")
        ]);

        doctors = doctorData;
        patients = patientData;
        appointments = appointmentData;

        renderSummary(summary);
        renderDoctors();
        renderPatients();
        renderAppointmentOptions();
        renderAppointments();
        renderRecentAppointments();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function renderSummary(summary) {
    summaryCards.innerHTML = [
        ["Bác sĩ", summary.doctors, "fa-user-doctor", "text-primary"],
        ["Bệnh nhân", patients.length, "fa-hospital-user", "text-success"],
        ["Lịch khám", summary.appointments, "fa-calendar-check", "text-warning"]
    ].map(([label, value, icon, color]) => `
        <div class="col-md-4"><div class="dashboard-card metric-card h-100"><i class="fas ${icon} ${color}"></i><div><div class="h2 mb-0">${value}</div><div class="text-muted">${label}</div></div></div></div>
    `).join("");

    const total = Math.max(summary.appointments, 1);
    const confirmed = Math.round((summary.confirmed / total) * 100);
    const pending = Math.round((summary.pending / total) * 100);
    const completed = Math.round((summary.completed / total) * 100);
    appointmentDonut.style.background = summary.appointments === 0
        ? "#e5edf5"
        : `conic-gradient(#198754 0 ${confirmed}%, #ffc107 ${confirmed}% ${confirmed + pending}%, #0dcaf0 ${confirmed + pending}% ${confirmed + pending + completed}%, #6c757d ${confirmed + pending + completed}% 100%)`;
    appointmentDonut.innerHTML = `<span>${summary.appointments}<small>Lịch</small></span>`;
    donutLegend.innerHTML = `Đã xác nhận: ${summary.confirmed} | Chưa xác nhận: ${summary.pending} | Đã khám: ${summary.completed} | Đã hủy: ${summary.canceled}`;
}

function renderDoctors() {
    doctorTable.innerHTML = doctors.length ? doctors.map((doctor) => `
        <tr>
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${doctor.user?.email || "Chưa cấp"}</td>
            <td><div class="d-flex gap-2"><button class="btn btn-outline-primary btn-sm" onclick="editDoctor(${doctor.id})">Sửa</button><button class="btn btn-outline-danger btn-sm" onclick="deleteDoctor(${doctor.id})">Xóa</button></div></td>
        </tr>
    `).join("") : `<tr><td colspan="5" class="text-center text-muted">Chưa có bác sĩ.</td></tr>`;
}

function renderPatients() {
    patientTable.innerHTML = patients.length ? patients.map((patient) => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.email}</td>
            <td>${patient.phone || "Chưa cập nhật"}</td>
            <td>${patient.gender || "Chưa cập nhật"}</td>
            <td><div class="d-flex gap-2"><button class="btn btn-outline-primary btn-sm" onclick="editPatient(${patient.id})">Sửa</button><button class="btn btn-outline-danger btn-sm" onclick="deletePatient(${patient.id})">Xóa</button></div></td>
        </tr>
    `).join("") : `<tr><td colspan="6" class="text-center text-muted">Chưa có bệnh nhân.</td></tr>`;
}

function renderAppointmentOptions() {
    document.getElementById("appointmentPatient").innerHTML = `<option value="">Chọn bệnh nhân</option>` + patients.map((patient) => `<option value="${patient.id}">${patient.name} - ${patient.email}</option>`).join("");
    document.getElementById("appointmentDoctor").innerHTML = `<option value="">Chọn bác sĩ</option>` + doctors.map((doctor) => `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`).join("");
}

function renderAppointments() {
    appointmentTable.innerHTML = appointments.length ? appointments.map((appointment) => `
        <tr>
            <td>${appointment.id}</td>
            <td>${appointment.patient.name}</td>
            <td>${appointment.doctor.name}</td>
            <td>${appointment.examDate}</td>
            <td>${appointment.symptoms || ""}</td>
            <td><span class="badge ${statusClass(appointment.status)}">${statusLabel(appointment.status)}</span></td>
            <td><div class="d-flex gap-2"><button class="btn btn-outline-primary btn-sm" onclick="editAppointment(${appointment.id})">Sửa</button><button class="btn btn-outline-danger btn-sm" onclick="deleteAppointment(${appointment.id})">Xóa</button></div></td>
        </tr>
    `).join("") : `<tr><td colspan="7" class="text-center text-muted">Chưa có lịch hẹn.</td></tr>`;
}

function renderRecentAppointments() {
    const recent = appointments.slice(-5).reverse();
    recentAppointmentTable.innerHTML = recent.length ? recent.map((appointment) => `
        <tr><td>${appointment.id}</td><td>${appointment.patient.name}</td><td>${appointment.doctor.name}</td><td>${appointment.examDate}</td><td><span class="badge ${statusClass(appointment.status)}">${statusLabel(appointment.status)}</span></td></tr>
    `).join("") : `<tr><td colspan="5" class="text-center text-muted">Chưa có lịch hẹn.</td></tr>`;
}

async function saveDoctor(event) {
    event.preventDefault();
    const id = document.getElementById("doctorId").value;
    const body = {
        name: document.getElementById("doctorName").value,
        specialty: document.getElementById("doctorSpecialty").value,
        accountEmail: document.getElementById("doctorAccountEmail").value,
        accountPassword: document.getElementById("doctorAccountPassword").value
    };
    await saveEntity(id ? `/admin/doctors/${id}` : "/admin/doctors", id ? "PUT" : "POST", body, resetDoctorForm, "Lưu bác sĩ thành công.");
}

async function savePatient(event) {
    event.preventDefault();
    const id = document.getElementById("patientId").value;
    const body = {
        name: document.getElementById("patientName").value,
        email: document.getElementById("patientEmail").value,
        password: document.getElementById("patientPassword").value,
        dateOfBirth: document.getElementById("patientDateOfBirth").value || null,
        gender: document.getElementById("patientGender").value,
        phone: document.getElementById("patientPhone").value
    };
    await saveEntity(id ? `/admin/patients/${id}` : "/admin/patients", id ? "PUT" : "POST", body, resetPatientForm, "Lưu bệnh nhân thành công.");
}

async function saveAppointment(event) {
    event.preventDefault();
    const id = document.getElementById("appointmentId").value;
    const body = {
        patientId: Number(document.getElementById("appointmentPatient").value),
        doctorId: Number(document.getElementById("appointmentDoctor").value),
        examDate: document.getElementById("appointmentExamDate").value,
        symptoms: document.getElementById("appointmentSymptoms").value,
        status: document.getElementById("appointmentStatus").value
    };
    await saveEntity(id ? `/admin/appointments/${id}` : "/admin/appointments", id ? "PUT" : "POST", body, resetAppointmentForm, "Lưu lịch khám thành công.");
}

async function saveEntity(path, method, body, resetFn, message) {
    try {
        await apiFetch(path, {method, headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});
        showAlert(message, "success");
        resetFn();
        await loadDashboard();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function editDoctor(id) {
    const doctor = doctors.find((item) => item.id === id);
    document.getElementById("doctorId").value = doctor.id;
    document.getElementById("doctorName").value = doctor.name;
    document.getElementById("doctorSpecialty").value = doctor.specialty;
    document.getElementById("doctorAccountEmail").value = doctor.user?.email || "";
    document.getElementById("doctorAccountPassword").value = "";
    showSection("doctorSection", document.querySelector('[data-section="doctorSection"]'));
}

function editPatient(id) {
    const patient = patients.find((item) => item.id === id);
    document.getElementById("patientId").value = patient.id;
    document.getElementById("patientName").value = patient.name;
    document.getElementById("patientEmail").value = patient.email;
    document.getElementById("patientPassword").value = "";
    document.getElementById("patientDateOfBirth").value = patient.dateOfBirth || "";
    document.getElementById("patientGender").value = patient.gender || "";
    document.getElementById("patientPhone").value = patient.phone || "";
    showSection("patientSection", document.querySelector('[data-section="patientSection"]'));
}

function editAppointment(id) {
    const appointment = appointments.find((item) => item.id === id);
    document.getElementById("appointmentId").value = appointment.id;
    document.getElementById("appointmentPatient").value = appointment.patient.id;
    document.getElementById("appointmentDoctor").value = appointment.doctor.id;
    document.getElementById("appointmentExamDate").value = appointment.examDate;
    document.getElementById("appointmentStatus").value = appointment.status;
    document.getElementById("appointmentSymptoms").value = appointment.symptoms || "";
    showSection("appointmentSection", document.querySelector('[data-section="appointmentSection"]'));
}

async function deleteDoctor(id) {
    await deleteEntity(`/admin/doctors/${id}`, "Bạn chắc chắn muốn xóa bác sĩ này?", "Xóa bác sĩ thành công.");
}

async function deletePatient(id) {
    await deleteEntity(`/admin/patients/${id}`, "Xóa bệnh nhân sẽ xóa cả lịch khám liên quan. Tiếp tục?", "Xóa bệnh nhân thành công.");
}

async function deleteAppointment(id) {
    await deleteEntity(`/admin/appointments/${id}`, "Bạn chắc chắn muốn xóa lịch khám này?", "Xóa lịch khám thành công.");
}

async function deleteEntity(path, confirmMessage, successMessage) {
    if (!confirm(confirmMessage)) return;
    try {
        await apiFetch(path, {method: "DELETE"});
        showAlert(successMessage, "success");
        await loadDashboard();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function resetDoctorForm() {
    document.getElementById("doctorForm").reset();
    document.getElementById("doctorId").value = "";
}

function resetPatientForm() {
    document.getElementById("patientForm").reset();
    document.getElementById("patientId").value = "";
}

function resetAppointmentForm() {
    document.getElementById("appointmentForm").reset();
    document.getElementById("appointmentId").value = "";
}

async function apiFetch(path, options = {}) {
    const response = await fetch(path, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra khi gọi API.");
    return data;
}

function statusClass(status) {
    return {
        PENDING: "text-bg-warning",
        CONFIRMED: "text-bg-success",
        REJECTED: "text-bg-danger",
        COMPLETED: "text-bg-info",
        CANCELED: "text-bg-secondary"
    }[status] || "text-bg-secondary";
}

function statusLabel(status) {
    return {
        PENDING: "Chưa xác nhận",
        CONFIRMED: "Đã xác nhận",
        REJECTED: "Đã từ chối",
        COMPLETED: "Đã khám",
        CANCELED: "Đã hủy"
    }[status] || status;
}

function showAlert(message, type) {
    adminMessage.className = `alert alert-${type}`;
    adminMessage.textContent = message;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
}
