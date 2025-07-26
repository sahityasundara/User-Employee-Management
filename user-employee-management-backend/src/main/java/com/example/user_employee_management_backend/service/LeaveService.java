package com.example.user_employee_management_backend.service;

import com.example.user_employee_management_backend.dto.LeaveBalanceResponseDto; // <-- IMPORT
import com.example.user_employee_management_backend.dto.LeaveRequestDto;
import com.example.user_employee_management_backend.dto.LeaveRequestResponseDto; // <-- IMPORT
import com.example.user_employee_management_backend.model.*;
import com.example.user_employee_management_backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true) // Set a default read-only transaction for all methods
public class LeaveService {

    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private LeaveBalanceRepository leaveBalanceRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private LeaveTypeRepository leaveTypeRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public LeaveRequest submitLeaveRequest(String username, LeaveRequestDto requestDto) {
        // This method's internal logic is correct
        if (requestDto.endDate().isBefore(requestDto.startDate())) {
            throw new IllegalArgumentException("Leave end date cannot be before the start date.");
        }
        Employee employee = findEmployeeByUsername(username);
        LeaveType leaveType = leaveTypeRepository.findById(requestDto.leaveTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Leave Type not found"));
        long daysRequested = ChronoUnit.DAYS.between(requestDto.startDate(), requestDto.endDate()) + 1;
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeAndLeaveType(employee, leaveType)
                .orElseThrow(() -> new IllegalStateException("No leave balance found for this leave type."));

        if (balance.getRemainingDays() < daysRequested) {
            throw new IllegalStateException("Insufficient leave balance.");
        }
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(requestDto.startDate());
        leaveRequest.setEndDate(requestDto.endDate());
        leaveRequest.setReason(requestDto.reason());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Retrieves all leave requests for an employee AND converts them to DTOs.
     * The return type is now List<LeaveRequestResponseDto>.
     */
    public List<LeaveRequestResponseDto> getMyLeaveRequests(String username) {
        Employee employee = findEmployeeByUsername(username);
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeId(employee.getId());
        return requests.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all leave balances for an employee AND converts them to DTOs.
     * The return type is now List<LeaveBalanceResponseDto>.
     */
    public List<LeaveBalanceResponseDto> getMyLeaveBalances(String username) {
        Employee employee = findEmployeeByUsername(username);
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeId(employee.getId());
        return balances.stream()
                .map(LeaveBalanceResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all PENDING leave requests and converts them to DTOs.
     * The return type is now List<LeaveRequestResponseDto>.
     */
    // ... inside your LeaveService class ...

    /**
     * Retrieves all PENDING leave requests and converts them to DTOs for the manager.
     * It now calls the new, optimized repository method.
     */
// ... (This file should contain the null-safe convertToResponseDto method from the previous answer)
// Ensure the getPendingRequests method is EXACTLY this:
    public List<LeaveRequestResponseDto> getPendingRequests() {
        // --- THIS IS THE FIX ---
        // We now call our new, explicit query method.
        List<LeaveRequest> pendingRequests = leaveRequestRepository.findByStatusWithDetails(LeaveStatus.PENDING);

        if (pendingRequests == null) {
            return Collections.emptyList();
        }
        return pendingRequests.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

// ... rest of the file ...

    // ... inside LeaveService.java ...

    @Transactional
    public LeaveRequest updateRequestStatus(Long requestId, LeaveStatus newStatus) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Leave Request not found with ID: " + requestId));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("This leave request has already been processed.");
        }

        // Only deduct days if the request is being approved
        if (newStatus == LeaveStatus.APPROVED) {
            long daysRequested = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            LeaveBalance balance = leaveBalanceRepository.findByEmployeeAndLeaveType(request.getEmployee(), request.getLeaveType())
                    .orElseThrow(() -> new IllegalStateException("No leave balance found for this employee and leave type."));

            if (balance.getRemainingDays() < daysRequested) {
                throw new IllegalStateException("Cannot approve. Employee has insufficient leave balance.");
            }

            balance.setRemainingDays(balance.getRemainingDays() - (int) daysRequested);

            // --- THIS IS THE CRITICAL FIX ---
            // You must save the updated balance object back to the database.
            leaveBalanceRepository.save(balance);
        }

        request.setStatus(newStatus);
        return leaveRequestRepository.save(request);
    }

    private Employee findEmployeeByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        return employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("No employee profile is associated with your user account."));
    }

    /**
     * Private helper method to convert a LeaveRequest entity to its DTO representation.
     */
    private LeaveRequestResponseDto convertToResponseDto(LeaveRequest leaveRequest) {
        String employeeName = (leaveRequest.getEmployee() != null) ? leaveRequest.getEmployee().getName() : "Unknown Employee";
        String leaveTypeName = (leaveRequest.getLeaveType() != null) ? leaveRequest.getLeaveType().getName() : "Unknown Type";

        return new LeaveRequestResponseDto(
                leaveRequest.getId(),
                employeeName,
                leaveTypeName,
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getStatus(),
                leaveRequest.getReason()
        );
    }
}
