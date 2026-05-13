**Healthcare Appointment Management System**

Một ứng dụng web mẫu để quản lý đặt lịch khám bệnh, phù hợp cho mục đích học tập và demo kiến trúc Spring Boot — phân tách rõ `controller`, `service`, `repository`, `entity`, `dto`.

**Tính năng chính**
- Quản lý người dùng: đăng ký, đăng nhập (Admin/Doctor/Patient).
- Patient: tìm bác sĩ, đặt lịch, xem lịch cá nhân.
- Doctor: xem lịch được phân công, xác nhận/từ chối lịch.
- Admin: quản lý bác sĩ, bệnh nhân, lịch khám và xem báo cáo tổng quan.

**Công nghệ**
- Backend: Java, Spring Boot, Spring Data JPA
- Frontend: HTML/CSS/JavaScript (static pages)
- Database: MySQL

---

**Bắt đầu nhanh (Quick start)**

Yêu cầu cài đặt trước:
- Java 17
- Maven
- MySQL

1) Cấu hình kết nối database: chỉnh `src/main/resources/application.properties` (username/password/url).

Ví dụ tối thiểu:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthcare_appointments?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

2) Chạy ứng dụng từ thư mục gốc dự án:

```bash
mvn spring-boot:run
```

3) Mở trình duyệt:
- Trang chính (patient): http://localhost:8080
- Admin dashboard: http://localhost:8080/admin.html
- Doctor dashboard: http://localhost:8080/doctor.html

---

**Dữ liệu mẫu (Seed)**
Khi chạy lần đầu, ứng dụng sẽ tạo một số tài khoản mẫu để demo:

- Admin: admin@clinic.com / 123456
- Doctor: doctor@clinic.com / 123456
- Patient: patient@clinic.com / 123456

Lưu ý: mật khẩu mẫu chỉ để demo — không sử dụng trong môi trường thực tế.

---

**Các endpoint chính (tóm tắt)**

- Auth: `POST /register`, `POST /login`
- Appointments: `POST /appointments`, `GET /appointments/patient/{id}`, `GET /appointments/doctor/{id}`
- Doctor: `GET /doctors`, `GET /doctors/account/{userId}`
- Admin: CRUD cho `patients`, `doctors`, `appointments` và `GET /admin/summary`

Ví dụ nhanh (cURL):

```bash
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d '{"email":"patient@clinic.com","password":"123456"}'
```

---

**Kiến trúc & cấu trúc mã nguồn**

src/main/java/com/healthcare/appointment
- `config`     : cấu hình & seed dữ liệu
- `controller` : REST controllers
- `service`    : business logic
- `repository` : Spring Data repositories
- `entity`     : JPA entities
- `dto`        : request/response DTOs

Static assets (frontend đơn giản) nằm ở `src/main/resources/static`.

---

**Phát triển & kiểm thử**
- Build: `mvn clean package`
- Chạy: `mvn spring-boot:run`

Nếu cần chạy trên môi trường có `JAVA_HOME` khác trên PowerShell:

```powershell
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-17.0.x'
mvn spring-boot:run
```

---

**Bảo mật & cải tiến (gợi ý)**
- Hiện tại mật khẩu lưu cho mục demo; để sản phẩm thực tế cần bổ sung:
  - Spring Security + mã hóa mật khẩu (BCrypt)
  - JWT hoặc session quản lý xác thực
  - Kiểm thử bảo mật và filtering input

---

**Đóng góp**
Mọi đóng góp xin gửi PR hoặc issue. Vui lòng tuân theo chuẩn codebase và mô tả thay đổi rõ ràng.

**Giấy phép**
Ghi rõ giấy phép nếu cần (mặc định không có).

---

Nếu bạn muốn, mình có thể:
- Dịch README sang tiếng Anh.
- Thêm hướng dẫn API chi tiết với ví dụ request/response.
- Thêm mục Troubleshooting và FAQ.


