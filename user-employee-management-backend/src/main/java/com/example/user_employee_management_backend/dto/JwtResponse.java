package com.example.user_employee_management_backend.dto;

import java.util.List;

public record JwtResponse(String token, String username, List<String> roles, boolean firstTimeLogin) {
}