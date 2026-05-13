package com.healthcare.appointment.dto;

import com.healthcare.appointment.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 50, message = "Tên phải từ 2 trở lên và không quá 50 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\s'-]+$", message = "Tên chỉ được chứa chữ cái và khoảng trắng")
    private String name;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Email phải có định dạng hợp lệ. Ví dụ: example@gmail.com")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotNull
    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
