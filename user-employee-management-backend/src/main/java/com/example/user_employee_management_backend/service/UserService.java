package com.example.user_employee_management_backend.service;

import com.example.user_employee_management_backend.dto.AdminDashboardStatsDto;
import com.example.user_employee_management_backend.dto.UserCreateRequest;
import com.example.user_employee_management_backend.dto.UserDto;
import com.example.user_employee_management_backend.model.*;
import com.example.user_employee_management_backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private LeaveTypeRepository leaveTypeRepository;
    @Autowired private LeaveBalanceRepository leaveBalanceRepository;

    /**
     * A "Smart" user creation method. If the role is HR or Manager, it also creates
     * an associated Employee record and seeds their default leave balances.
     */
    @Transactional
    public User createUser(UserCreateRequest request) {
        // --- 1. Validation Checks ---
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Error: A user with this username (email) already exists.");
        }
        if (employeeRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Error: An employee with this email already exists.");
        }

        // --- 2. Create the User Record ---
        User newUser = new User();
        newUser.setUsername(request.username());
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setRole(request.role());
        newUser.setFirstTimeLogin(true);
        newUser.setEnabled(true);
        User savedUser = userRepository.save(newUser);

        // --- 3. If HR or Manager, create Employee record and balances ---
        if (request.role() == Role.ROLE_HR || request.role() == Role.ROLE_MANAGER) {
            Employee employeeProfile = new Employee();
            employeeProfile.setName(request.username()); // Use username as name for simplicity
            employeeProfile.setEmail(request.email());
            employeeProfile.setDepartment(request.role().name().replace("ROLE_", ""));
            employeeProfile.setDateJoined(LocalDate.now());
            employeeProfile.setStatus(EmployeeStatus.ACTIVE);
            employeeProfile.setProfileComplete(true);
            Employee savedEmployeeProfile = employeeRepository.save(employeeProfile);

            // Seed their leave balances
            List<LeaveType> allLeaveTypes = leaveTypeRepository.findAll();
            for (LeaveType type : allLeaveTypes) {
                LeaveBalance newBalance = new LeaveBalance();
                newBalance.setEmployee(savedEmployeeProfile);
                newBalance.setLeaveType(type);
                newBalance.setRemainingDays(type.getDefaultDays());
                leaveBalanceRepository.save(newBalance);
            }
        }

        return savedUser;
    }

    public AdminDashboardStatsDto getAdminDashboardStats() {
        long totalActiveUsers = userRepository.countByEnabled(true);
        long disabledUsers = userRepository.countByEnabled(false);
        long totalHrs = userRepository.countByRole(Role.ROLE_HR);
        long totalManagers = userRepository.countByRole(Role.ROLE_MANAGER);
        return new AdminDashboardStatsDto(totalActiveUsers, totalHrs, totalManagers, disabledUsers);
    }

    public List<UserDto> getManageableUsers() {
        return userRepository.findByRoleNot(Role.ROLE_ADMIN).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void setUserStatus(Long userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setEnabled(status);
        userRepository.save(user);
    }

    private UserDto convertToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}