# PayFlow - User & Employee Management System

## Project Overview

PayFlow is a full-stack web application designed to be a comprehensive Human Resource Management (HRM) platform. This system provides a secure, role-based environment for managing user accounts, onboarding new employees, and handling a complete leave management workflow.

The application is built with a modern technology stack, featuring a **Spring Boot** backend API and a **React** single-page application (SPA) frontend.

---

## Features

### 1. Role-Based Access Control (RBAC)
The application has a robust security system with four distinct user roles, each with specific permissions:

*   **Admin:** The super-user. Can create and manage user accounts for HR and Managers. Has access to a system-wide statistics dashboard.
*   **HR:** Can onboard new employees, which automatically creates their user accounts. Can view and manage all employee records. Can also manage their own leave.
*   **Manager:** Has all the permissions of an HR user. Additionally, a Manager is the only role that can **approve or deny** leave requests submitted by employees.
*   **Employee:** The standard user. Can log in, view their leave balances, submit new leave requests, and view their leave history.

### 2. User & Employee Management
*   Secure user login with JWT (JSON Web Token) authentication.
*   Mandatory password reset for all new users on their first login.
*   **Smart Onboarding:** HR/Managers can onboard new employees by filling out a single form, which automatically creates both the `Employee` profile and the corresponding `User` login account.
*   Admin dashboard to view all users, user statistics, and enable/disable accounts.

### 3. Leave Management Module
*   Employees can view their available leave balances (e.g., Annual, Sick).
*   A simple modal form for employees to apply for leave.
*   A dedicated "Approve Leaves" dashboard for Managers to view and act upon all pending leave requests.
*   The system automatically deducts leave days from an employee's balance upon approval.

### 4. Professional User Interface
*   Clean, responsive dashboards for each user role.
*   Styled with **Bootstrap** for a consistent and modern look.
*   Interactive, user-friendly notifications and confirmation dialogs using **SweetAlert2**.

---

## Technology Stack

*   **Backend:**
    *   **Java 17**
    *   **Spring Boot 3+**
    *   **Spring Security:** For authentication and authorization with JWT.
    *   **Spring Data JPA (Hibernate):** For object-relational mapping.
    *   **Maven:** For dependency management.

*   **Frontend:**
    *   **React 18**
    *   **React Router:** For client-side routing.
    *   **Axios:** For making API calls to the backend.
    *   **Bootstrap 4:** For styling and layout.
    *   **SweetAlert2:** For pop-up notifications and dialogs.

*   **Database:**
    *   **MySQL:** A reliable relational database for storing all application data.

---

## Getting Started

### Prerequisites

*   Java JDK 17 or newer
*   Maven 3.8+
*   Node.js 16+ and npm
*   A running instance of MySQL server

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd user-employee-management-backend
    ```
2.  **Configure the database:**
    *   Open `src/main/resources/application.properties`.
    *   Update `spring.datasource.username` and `spring.datasource.password` with your MySQL credentials.
3.  **Create the database:**
    *   In your MySQL client, run the command: `CREATE DATABASE user_employee_management;`
4.  **Run the application:**
    *   The backend is configured with `spring.jpa.hibernate.ddl-auto=update`, so it will automatically create the tables on the first run.
    *   Run the application from your IDE or using the command:
    ```bash
    mvn spring-boot:run
    ```
    The backend will start on `http://localhost:8080`. The default admin user will be created with username `admin` and password `password`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../user-employee-management-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
    The frontend will start on `http://localhost:3000` and will automatically open in your browser.

---

## Application Workflow

1.  Log in as `admin` / `password`.
2.  Use the "Manage Users" dashboard to create an HR, Manager, or Employee user.
3.  Log out and log in as the new user. You will be forced to reset your password.
4.  Log in again with the new password to access your role-specific dashboard.
5.  As an HR/Manager, use the "Onboard New Hire" page to create an employee, which also creates their user account.
6.  Log in as that new employee to test the leave application process.
7.  Log in as a Manager to approve the leave request.
