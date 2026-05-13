**🌟Giới Thiệu Dự Án: Healthcare Appointment Management System**

Healthcare Appointment Management System là hệ thống web hỗ trợ đặt lịch khám bệnh trực tuyến, cho phép bệnh nhân đặt lịch, bác sĩ xử lý lịch khám và admin quản lý toàn bộ hệ thống.
**Tính năng chính**
- Quản lý người dùng: đăng ký, đăng nhập (Admin/Doctor/Patient).
- Patient: tìm bác sĩ, đặt lịch, xem lịch cá nhân.
- Doctor: xem lịch được phân công, xác nhận/từ chối lịch.
- Admin: quản lý bác sĩ, bệnh nhân, lịch khám và xem báo cáo tổng quan.

**💻Công Nghệ Sử Dụng**
- Backend: Java, Spring Boot, Spring Data JPA
- Frontend: HTML/CSS/JavaScript (static pages)
- Database: MySQL

---
**🚀 Hướng Dẫn Khởi Chạy**
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
- Trang chính: http://localhost:8080
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


