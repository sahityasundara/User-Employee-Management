package com.example.user_employee_management_backend.dto;

public record AdminDashboardStatsDto(
        long totalActiveUsers,
        long totalHrs,
        long totalManagers,
        long disabledUsers
) {}
