package com.example.user_employee_management_backend.controller;

import com.example.user_employee_management_backend.dto.AdminDashboardStatsDto;
import com.example.user_employee_management_backend.dto.UserCreateRequest;
import com.example.user_employee_management_backend.dto.UserDto;
import com.example.user_employee_management_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for all administrative actions.
 * Access is restricted to users with the 'ROLE_ADMIN'.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * Endpoint for an Admin to create a new user (HR or Manager).
     * @param userCreateRequest DTO containing username, password, and role.
     * @return A success or error response.
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest userCreateRequest) {
        try {
            // Call the service to handle the business logic of user creation.
            userService.createUser(userCreateRequest);
            return ResponseEntity.ok("User created successfully with role: " + userCreateRequest.role());
        } catch (IllegalArgumentException e) {
            // If the service throws an exception (e.g., username exists), return a bad request.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint to fetch statistics for the Admin Dashboard homepage.
     * @return A DTO with various user counts.
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(userService.getAdminDashboardStats());
    }

    /**
     * Endpoint to fetch a list of all non-admin users for the "Manage Users" page.
     * @return A list of UserDto objects.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getManageableUsers());
    }

    /**
     * Endpoint to enable or disable a user's account.
     * @param id The ID of the user to update.
     * @param status A request body map, e.g., { "enabled": true }
     * @return A success or error response.
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        Boolean isEnabled = status.get("enabled");
        if (isEnabled == null) {
            return ResponseEntity.badRequest().body("Request body must contain an 'enabled' field (true or false).");
        }
        try {
            userService.setUserStatus(id, isEnabled);
            return ResponseEntity.ok("User status updated successfully.");
        } catch (Exception e) {
            // Catches potential errors like user not found.
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}