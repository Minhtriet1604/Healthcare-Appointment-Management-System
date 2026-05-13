const dashboardLayout = document.getElementById("dashboardLayout");
const doctorMessage = document.getElementById("doctorMessage");
const todayCount = document.getElementById("todayCount");
const pendingCount = document.getElementById("pendingCount");
const patientCount = document.getElementById("patientCount");
const todayTable = document.getElementById("todayTable");
const appointmentTable = document.getElementById("appointmentTable");
const approvalTable = document.getElementById("approvalTable");
const patientProfiles = document.getElementById("patientProfiles");
const doctorAccountName = document.getElementById("doctorAccountName");

let currentDoctor = null;
let appointments = [];

document.addEventListener("DOMContentLoaded", async () => {
    protectDoctorPage();
    bindEvents();
    await loadCurrentDoctor();
});

function protectDoctorPage() {
    const user = getCurrentUser();
    if (!user || (user.role !== "DOCTOR" && user.role !== "ADMIN")) window.location.href = "/";
}

function bindEvents() {
    document.getElementById("logoutButton").addEventListener("click", logout);
    document.getElementById("sidebarToggle").addEventListener("click", () => dashboardLayout.classList.toggle("sidebar-collapsed"));
    document.getElementById("refreshButton").addEventListener("click", loadAppointments);
    document.querySelectorAll(".sidebar-menu .sidebar-link").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.section, button));
    });
}

function showSection(sectionId, activeButton) {
    document.querySelectorAll(".dashboard-section").forEach((section) => section.classList.toggle("active", section.id === sectionId));
    document.querySelectorAll(".sidebar-menu .sidebar-link").forEach((button) => button.classList.toggle("active", button === activeButton));
}

async function loadCurrentDoctor() {
    const user = getCurrentUser();
    try {
        currentDoctor = user.doctorId
            ? {id: user.doctorId, name: user.name}
            : await apiFetch(`/doctors/account/${user.id}`);
        doctorAccountName.textContent = currentDoctor.name || user.name;
        await loadAppointments();
    } catch (error) {
        renderEmptyState();
        showAlert("Tài khoản này chưa được Admin gắn với hồ sơ bác sĩ.", "warning");
    }
}

async function loadAppointments() {
    if (!currentDoctor?.id) {
        renderEmptyState();
        return;
    }

    try {
        appointments = await apiFetch(`/appointments/doctor/${currentDoctor.id}`);
        renderOverview();
        renderSchedule();
        renderApprovalList();
        renderPatientProfiles();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function renderOverview() {
    const today = toLocalDateString(new Date());
    const todayAppointments = appointments.filter((appointment) => appointment.examDate === today);
    const pendingAppointments = appointments.filter((appointment) => appointment.status === "PENDING");
    const patients = uniquePatients();

    todayCount.textContent = todayAppointments.length;
    pendingCount.textContent = pendingAppointments.length;
    patientCount.textContent = patients.length;

    todayTable.innerHTML = todayAppointments.length ? todayAppointments.map((appointment) => `
        <tr><td>${appointment.id}</td><td>${appointment.patient.name}</td><td>${appointment.patient.email}</td><td>${appointment.symptoms || ""}</td><td><span class="badge ${statusClass(appointment.status)}">${statusLabel(appointment.status)}</span></td></tr>
    `).join("") : `<tr><td colspan="5" class="text-center text-muted">Hôm nay chưa có lịch khám.</td></tr>`;
}

function renderSchedule() {
    appointmentTable.innerHTML = appointments.length ? appointments.map((appointment) => `
        <tr><td>${appointment.id}</td><td>${appointment.patient.name}</td><td>${appointment.patient.email}</td><td>${appointment.examDate}</td><td>${appointment.symptoms || ""}</td><td><span class="badge ${statusClass(appointment.status)}">${statusLabel(appointment.status)}</span></td></tr>
    `).join("") : `<tr><td colspan="6" class="text-center text-muted">Chưa có lịch thuộc về bác sĩ này.</td></tr>`;
}

function renderApprovalList() {
    approvalTable.innerHTML = appointments.length ? appointments.map((appointment) => `
        <tr>
            <td>${appointment.id}</td>
            <td>${appointment.patient.name}</td>
            <td>${appointment.examDate}</td>
            <td>${appointment.symptoms || ""}</td>
            <td><span class="badge ${statusClass(appointment.status)}">${statusLabel(appointment.status)}</span></td>
            <td><div class="d-flex gap-2"><button class="btn btn-success btn-sm" onclick="updateAppointment(${appointment.id}, 'confirm')">Xác nhận</button><button class="btn btn-danger btn-sm" onclick="updateAppointment(${appointment.id}, 'reject')">Từ chối</button></div></td>
        </tr>
    `).join("") : `<tr><td colspan="6" class="text-center text-muted">Chưa có lịch cần xử lý.</td></tr>`;
}

function renderPatientProfiles() {
    const patients = uniquePatients();
    patientProfiles.innerHTML = patients.length ? patients.map((patient) => `
        <div class="col-md-6 col-xl-4"><div class="patient-profile-card"><div class="profile-avatar">${patient.name.charAt(0).toUpperCase()}</div><h3 class="h6 mb-1">${patient.name}</h3><p class="text-muted small mb-2">${patient.email}</p><p class="mb-1"><strong>SĐT:</strong> ${patient.phone || "Chưa cập nhật"}</p><p class="mb-1"><strong>Giới tính:</strong> ${patient.gender || "Chưa cập nhật"}</p><p class="mb-0"><strong>Ngày sinh:</strong> ${patient.dateOfBirth || "Chưa cập nhật"}</p></div></div>
    `).join("") : `<div class="col-12"><p class="text-muted mb-0">Chưa có hồ sơ bệnh nhân.</p></div>`;
}

async function updateAppointment(id, action) {
    try {
        await apiFetch(`/appointments/${id}/${action}`, {method: "PUT"});
        showAlert(action === "confirm" ? "Đã xác nhận lịch khám." : "Đã từ chối lịch khám.", "success");
        await loadAppointments();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function uniquePatients() {
    const patientMap = new Map();
    appointments.forEach((appointment) => patientMap.set(appointment.patient.id, appointment.patient));
    return Array.from(patientMap.values());
}

function renderEmptyState() {
    todayCount.textContent = "0";
    pendingCount.textContent = "0";
    patientCount.textContent = "0";
    todayTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Chưa có dữ liệu.</td></tr>`;
    appointmentTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Chưa có dữ liệu.</td></tr>`;
    approvalTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Chưa có dữ liệu.</td></tr>`;
    patientProfiles.innerHTML = `<div class="col-12"><p class="text-muted mb-0">Chưa có dữ liệu.</p></div>`;
}

async function apiFetch(path, options = {}) {
    const response = await fetch(path, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra khi gọi API.");
    return data;
}

function statusClass(status) {
    return {PENDING: "text-bg-warning", CONFIRMED: "text-bg-success", REJECTED: "text-bg-danger", COMPLETED: "text-bg-info", CANCELED: "text-bg-secondary"}[status] || "text-bg-secondary";
}

function statusLabel(status) {
    return {PENDING: "Chưa xác nhận", CONFIRMED: "Đã xác nhận", REJECTED: "Đã từ chối", COMPLETED: "Đã khám", CANCELED: "Đã hủy"}[status] || status;
}

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function showAlert(message, type) {
    doctorMessage.className = `alert alert-${type}`;
    doctorMessage.textContent = message;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
}
