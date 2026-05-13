const API_BASE_URL = "";
const doctorImages = [
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=700&q=80"
];

let doctors = [];

document.addEventListener("DOMContentLoaded", () => {
    renderUserSection();
    loadDoctors();
    bindAuthForms();
    bindBookingForm();
    bindFacilityForm();
    bindChatbot();
});

async function loadDoctors() {
    const doctorCards = document.getElementById("doctorCards");
    const doctorSelect = document.getElementById("doctorSelect");

    try {
        doctors = await apiFetch("/doctors");
        doctorCards.innerHTML = doctors.map((doctor, index) => doctorCard(doctor, index)).join("");
        doctorSelect.innerHTML = `<option value="">Chọn khoa / bác sĩ</option>` + doctors.map((doctor) => (
            `<option value="${doctor.id}">${doctor.specialty} - ${doctor.name}</option>`
        )).join("");
    } catch (error) {
        doctorCards.innerHTML = `<div class="col-12"><div class="alert alert-danger">${error.message}</div></div>`;
        doctorSelect.innerHTML = `<option value="">Không tải được danh sách bác sĩ</option>`;
    }
}

function doctorCard(doctor, index) {
    const experience = 8 + (index % 7);
    const image = doctorImages[index % doctorImages.length];
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card doctor-card h-100">
                <img src="${image}" class="card-img-top doctor-photo" alt="${doctor.name}">
                <div class="card-body">
                    <h5 class="card-title">${doctor.name}</h5>
                    <p class="card-text text-muted mb-0">Chuyên khoa: ${doctor.specialty}<br>Kinh nghiệm: ${experience} năm</p>
                    <div class="d-grid gap-2">
                        <a href="#booking-section" class="btn btn-outline-success" onclick="selectDoctor(${doctor.id})">Đặt lịch hẹn</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectDoctor(doctorId) {
    const doctorSelect = document.getElementById("doctorSelect");
    doctorSelect.value = String(doctorId);
}

function bindBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const messageEl = document.getElementById('bookingMessage');
        try {
            const user = getCurrentUser();

            const fullName = document.getElementById('fullName').value;
            const birthDate = document.getElementById('birthDate').value;
            const gender = document.getElementById('bookingGender').value;
            const address = document.getElementById('address').value;
            const email = document.getElementById('bookingEmail').value;
            const phone = document.getElementById('phone').value;
            const doctorSelect = document.getElementById('doctorSelect');
            const doctorId = doctorSelect ? (doctorSelect.value ? Number(doctorSelect.value) : null) : null;
            const specialty = (doctorSelect && doctorSelect.selectedOptions && doctorSelect.selectedOptions[0]) ? doctorSelect.selectedOptions[0].text.split(' - ')[0] : '';
            const examDate = document.getElementById('examDate').value;
            const symptoms = document.getElementById('symptoms').value;

            const payload = {
                patientId: user ? user.id : null,
                doctorId: doctorId,
                patientName: fullName,
                dateOfBirth: birthDate,
                gender: gender,
                email: email,
                phone: phone,
                specialty: specialty,
                examDate: examDate,
                symptoms: symptoms
            };

            await apiFetch('/appointments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            showAlert(messageEl, 'Gửi lịch hẹn thành công. Nhân viên sẽ liên hệ với bạn.', 'success');
            bookingForm.reset();
            // hide toggle icons after reset
            document.querySelectorAll('#registerForm .toggle-password, #loginForm .toggle-password').forEach(el => el.classList.remove('visible', 'show'));
        } catch (error) {
            showAlert(messageEl, error.message || 'Gửi lịch thất bại.', 'danger');
        }
    });
}
function bindAuthForms() {

    const regName = document.getElementById("registerName");
    const regEmail = document.getElementById("registerEmail");
    const regPassword = document.getElementById("registerPassword");
    const regConfirmPassword = document.getElementById("registerConfirmPassword");

    // ===== VALIDATE NAME =====
    if (regName) {
        regName.addEventListener("input", function () {
            const regex = /^[a-zA-ZÀ-ỹ\s'-]+$/;
            const error = document.getElementById("nameError");

            this.classList.remove("is-invalid", "is-valid");

            if (this.value.trim() === "") {
                error.style.display = "none";
                return;
            }

            if (!regex.test(this.value)) {
                this.classList.add("is-invalid");
                error.style.display = "block";
            } else {
                this.classList.add("is-valid");
                error.style.display = "none";
            }
        });
    }

    // ===== VALIDATE EMAIL =====
    if (regEmail) {
        regEmail.addEventListener("input", function () {
            const regex = /^[a-zA-Z0-9._]+@gmail\.com$/;
            const error = document.getElementById("emailError");

            this.classList.remove("is-invalid", "is-valid");

            if (this.value.trim() === "") {
                error.style.display = "none";
                return;
            }

            if (!regex.test(this.value)) {
                this.classList.add("is-invalid");
                error.style.display = "block";
                error.innerText = "Email không hợp lệ!";
            } else {
                this.classList.add("is-valid");
                error.style.display = "none";
            }
        });
    }

    // ===== CONFIRM PASSWORD =====
    if (regConfirmPassword && regPassword) {
        regConfirmPassword.addEventListener("input", function () {
            const confirmError = document.getElementById("confirmError");

            this.classList.remove("is-invalid", "is-valid");

            if (this.value.trim() === "") {
                confirmError.style.display = "none";
                return;
            }

            if (this.value !== regPassword.value) {
                this.classList.add("is-invalid");
                confirmError.style.display = "block";
            } else {
                this.classList.add("is-valid");
                confirmError.style.display = "none";
            }
        });
    }

    // ===== LOGIN EMAIL =====
    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail) {
        loginEmail.addEventListener("input", function () {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            this.classList.remove("is-invalid", "is-valid");

            if (this.value.trim() === "") return;

            if (!regex.test(this.value)) {
                this.classList.add("is-invalid");
            } else {
                this.classList.add("is-valid");
            }
        });
    }

    // ===== LOGIN =====
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const message = document.getElementById("loginMessage");

            try {
                const user = await apiFetch("/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        email: document.getElementById("loginEmail").value,
                        password: document.getElementById("loginPassword").value
                    })
                });

                localStorage.setItem("currentUser", JSON.stringify(user));
                showAlert(message, `Xin chào ${user.name}.`, "success");
                renderUserSection();
                fillPatientFields(user);
                // redirect based on role after short delay so user sees success message
                setTimeout(() => {
                    if (user.role === "ADMIN") {
                        window.location.href = "/admin.html";
                    } else if (user.role === "DOCTOR") {
                        window.location.href = "/doctor.html";
                    } else {
                        const modalEl = document.getElementById("loginModal");
                        try {
                            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                            modalInstance.hide();
                        } catch (e) {
                            // bootstrap may not be available; ignore
                        }
                    }
                }, 400);
            } catch (error) {
                showAlert(message, error.message, "danger");
            }
        });
    }

    // ===== REGISTER =====
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const password = regPassword.value;
            const confirmPassword = regConfirmPassword.value;
            const message = document.getElementById("registerMessage");
            const confirmError = document.getElementById("confirmError");

            if (password !== confirmPassword) {
                regConfirmPassword.classList.add("is-invalid");
                confirmError.style.display = "block";
                return;
            }

            try {
                const user = await apiFetch("/register", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        name: regName.value,
                        email: regEmail.value,
                        password,
                        role: "PATIENT"
                    })
                });

                localStorage.setItem("currentUser", JSON.stringify(user));
                renderUserSection();
                fillPatientFields(user);
                showAlert(message, "Đăng ký thành công", "success");

            } catch (error) {
                showAlert(message, error.message, "danger");
            }
        });
    }
}
      // ===== TOGGLE PASSWORD (registration form only) =====
    document.querySelectorAll("#registerForm .toggle-password").forEach(icon => {
        // ensure accessible role/label
        icon.setAttribute("role", "button");
        icon.setAttribute("tabindex", "0");
        icon.setAttribute("aria-pressed", "false");
        icon.setAttribute("aria-label", "Hiển thị mật khẩu");

        // target input element
        const input = document.getElementById(icon.dataset.target);
        if (!input) return;

        // render initial icon (eye)
        icon.innerHTML = '<i class="fa-solid fa-eye"></i>';

        // show icon only when input has value
        const updateVisibility = () => {
            const hasValue = input.value && input.value.trim() !== "";
            icon.classList.toggle('visible', hasValue);
            // if input emptied while currently showing text, keep it visible but do not auto-hide; preserve current type
            // (we choose to hide only when truly empty)
        };

        // initialize visibility
        updateVisibility();

        // wire input event to show/hide icon
        input.addEventListener('input', updateVisibility);

        // position the icon vertically centered to the input (fix alignment issues)
        const positionIcon = () => {
            const parent = icon.parentElement;
            if (!parent) return;
            const parentRect = parent.getBoundingClientRect();
            const inputRect = input.getBoundingClientRect();
            const iconHeight = icon.offsetHeight || 24;
            const topPx = Math.round((inputRect.top - parentRect.top) + (input.offsetHeight - iconHeight) / 2);
            icon.style.top = topPx + 'px';
            // ensure no translate conflicts
            icon.style.transform = 'none';
        };

        // initial positioning and responsive updates
        requestAnimationFrame(positionIcon);
        window.addEventListener('resize', positionIcon);
        input.addEventListener('focus', positionIcon);
        input.addEventListener('input', positionIcon);

        const toggle = () => {
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            icon.classList.toggle("show", isHidden);
            icon.setAttribute("aria-pressed", isHidden ? "true" : "false");
            icon.setAttribute("aria-label", isHidden ? "Ẩn mật khẩu" : "Hiển thị mật khẩu");
            // update FA icon
            icon.innerHTML = isHidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        };

        icon.addEventListener("click", toggle);
        icon.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
        });
    });

    // ===== Add toggle for login form password (dynamically) =====
    const loginInput = document.getElementById('loginPassword');
    if (loginInput) {
        const loginParent = loginInput.parentElement;
        if (loginParent && !loginParent.classList.contains('position-relative')) {
            loginParent.classList.add('position-relative');
        }

        // create toggle span if not exists
        if (!document.querySelector('#loginForm .toggle-password')) {
            const loginToggle = document.createElement('span');
            loginToggle.className = 'toggle-password';
            loginToggle.dataset.target = 'loginPassword';
            loginParent.appendChild(loginToggle);

            // initialize same behavior as register toggles
            // render initial icon
            loginToggle.setAttribute('role', 'button');
            loginToggle.setAttribute('tabindex', '0');
            loginToggle.setAttribute('aria-pressed', 'false');
            loginToggle.setAttribute('aria-label', 'Hiển thị mật khẩu');
            loginToggle.innerHTML = '<i class="fa-solid fa-eye"></i>';

            const updateVisibilityLogin = () => {
                const hasValue = loginInput.value && loginInput.value.trim() !== '';
                loginToggle.classList.toggle('visible', hasValue);
            };

            updateVisibilityLogin();
            loginInput.addEventListener('input', updateVisibilityLogin);

            const positionIconLogin = () => {
                const parentRect = loginParent.getBoundingClientRect();
                const inputRect = loginInput.getBoundingClientRect();
                const iconHeight = loginToggle.offsetHeight || 24;
                const topPx = Math.round((inputRect.top - parentRect.top) + (loginInput.offsetHeight - iconHeight) / 2);
                loginToggle.style.top = topPx + 'px';
                loginToggle.style.transform = 'none';
            };

            requestAnimationFrame(positionIconLogin);
            window.addEventListener('resize', positionIconLogin);
            loginInput.addEventListener('focus', positionIconLogin);
            loginInput.addEventListener('input', positionIconLogin);

            const toggleLogin = () => {
                const isHidden = loginInput.type === 'password';
                loginInput.type = isHidden ? 'text' : 'password';
                loginToggle.classList.toggle('show', isHidden);
                loginToggle.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
                loginToggle.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu');
                loginToggle.innerHTML = isHidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            };

            loginToggle.addEventListener('click', toggleLogin);
            loginToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleLogin();
                }
            });
        }
    }

function bindFacilityForm() {
    const districts = {
        hanoi: ["Ba Đình", "Cầu Giấy", "Đống Đa", "Hoàn Kiếm"],
        hcm: ["Quận 1", "Quận 3", "Bình Thạnh", "Tân Bình"],
        danang: ["Hải Châu", "Thanh Khê", "Sơn Trà"],
        ninhthuan: ["Phan Rang", "Ninh Hải", "Ninh Phước"],
        binhthuan: ["Phan Thiết", "La Gi", "Hàm Thuận Bắc"]
    };

    document.getElementById("province").addEventListener("change", (event) => {
        const districtSelect = document.getElementById("district");
        const options = districts[event.target.value] || [];
        districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>` + options.map((district) => (
            `<option value="${district}">${district}</option>`
        )).join("");
    });

    document.getElementById("facilityForm").addEventListener("submit", (event) => {
        event.preventDefault();
        document.getElementById("facilityResult").textContent = "Phòng Khám OOSD hiện hỗ trợ tư vấn và đặt lịch trực tuyến toàn quốc.";
    });
}

function bindChatbot() {
    const chatbot = document.getElementById("chatbot");
    const messages = document.getElementById("chatbotMessages");

    document.getElementById("chatbotToggle").addEventListener("click", () => {
        chatbot.classList.toggle("open");
    });

    document.getElementById("chatbotClose").addEventListener("click", () => {
        chatbot.classList.remove("open");
    });

    document.getElementById("chatbotForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("chatbotInput");
        messages.insertAdjacentHTML("beforeend", `<div class="user-message">${escapeHtml(input.value)}</div>`);
        messages.insertAdjacentHTML("beforeend", `<div class="bot-message">Bạn có thể chọn bác sĩ ở mục Bác sĩ hoặc điền form đặt lịch bên dưới. Nếu triệu chứng khẩn cấp, hãy gọi hotline 19000101.</div>`);
        input.value = "";
        messages.scrollTop = messages.scrollHeight;
    });
}

function renderUserSection() {
    const userSection = document.getElementById("userSection");
    const user = getCurrentUser();

    if (!user) {
        userSection.innerHTML = `
            <a href="tel:19000101" class="hotline-pill d-none d-xl-inline-flex"><i class="fas fa-phone-alt"></i><span>1900 0101</span></a>
            <a href="#booking-section" class="btn btn-primary nav-booking-btn">Đặt lịch</a>
            <button class="btn btn-outline-primary nav-login-btn" data-bs-toggle="modal" data-bs-target="#loginModal">Đăng nhập</button>
        `;
        return;
    }

    const dashboardLink = user.role === "ADMIN" ? "/admin.html" : user.role === "DOCTOR" ? "/doctor.html" : "#booking-section";
    userSection.innerHTML = `
        <span class="text-primary fw-semibold">${user.name}</span>
        <a class="btn btn-primary" href="${dashboardLink}">${user.role === "PATIENT" ? "Đặt lịch" : "Dashboard"}</a>
        <button class="btn btn-outline-secondary" onclick="logout()">Đăng xuất</button>
    `;
    fillPatientFields(user);
}

function fillPatientFields(user) {
    if (!user || user.role !== "PATIENT") {
        return;
    }

    document.getElementById("fullName").value = user.name || "";
    document.getElementById("bookingEmail").value = user.email || "";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
}

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi gọi API.");
    }

    return data;
}

function showAlert(element, message, type) {
    element.className = `alert alert-${type} mt-3`;
    element.textContent = message;
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}
