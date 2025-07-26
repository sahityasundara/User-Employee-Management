package com.example.user_employee_management_backend.repository;

import com.example.user_employee_management_backend.model.Role;
import com.example.user_employee_management_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 * This interface handles all database operations for Users.
 * Methods are automatically implemented by Spring based on their names.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their username. Used by Spring Security for authentication.
     * @param username The username to search for.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    Optional<User> findByUsername(String username);

    /**
     * Checks if a user with the given username already exists. Used during user creation.
     * @param username The username to check.
     * @return true if a user exists, false otherwise.
     */
    Boolean existsByUsername(String username);


    // --- NEW METHODS FOR ADMIN DASHBOARD ---

    /**
     * Counts users based on their enabled/disabled status.
     * Used for the "Active Users" and "Disabled Users" widgets on the Admin Dashboard.
     * @param enabled The status to count (true for enabled, false for disabled).
     * @return A long representing the count of users with that status.
     */
    long countByEnabled(boolean enabled);

    /**
     * Counts users by their role (e.g., ROLE_HR, ROLE_MANAGER).
     * Used for the "Total HRs" and "Total Managers" widgets on the Admin Dashboard.
     * @param role The Role enum to count.
     * @return A long representing the count of users with that role.
     */
    long countByRole(Role role);

    /**
     * Finds all users whose role is not the one specified.
     * Used to build the "Manage Users" list, preventing the Admin from seeing themselves in the list.
     * @param role The role to exclude (e.g., ROLE_ADMIN).
     * @return A List of User objects.
     */
    List<User> findByRoleNot(Role role);
}