package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.LoginRequest;
import com.healthcare.appointment.dto.RegisterRequest;
import com.healthcare.appointment.entity.User;
import com.healthcare.appointment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public User login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
}
