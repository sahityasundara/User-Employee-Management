package com.example.user_employee_management_backend.dto;

import com.example.user_employee_management_backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record UserCreateRequest(
        @NotBlank(message = "Username cannot be blank")
        String username,

        // Ensure this email field is here
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Email should be valid")
        String email,

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        @NotNull(message = "Role cannot be null")
        Role role
) {}