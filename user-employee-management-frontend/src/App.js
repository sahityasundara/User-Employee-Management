import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Import ALL Layouts and Pages, including the new Employee ones ---
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardLayout from './layouts/DashboardLayout';
import EmployeeLayout from './layouts/EmployeeLayout'; // <-- Added missing import
import AdminHomePage from './pages/AdminHomePage';
import ManageUsersPage from './pages/ManageUsersPage';
import DashboardHomePage from './pages/DashboardHomePage';
import EmployeeListPage from './pages/EmployeeListPage';
import OnboardingPage from './pages/OnboardingPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import LeaveApprovalPage from './pages/LeaveApprovalPage';
// NOTE: We don't need EmployeeHomePage yet, so it's commented out for now.
// import EmployeeHomePage from './pages/EmployeeHomePage'; 
import './App.css';

const MySwal = withReactContent(Swal);

const ProtectedRoute = ({ children, allowedRoles }) => {
    // ... This component is correct and does not need changes ...
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { return <Navigate to="/login" />; }
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) { return <Navigate to="/login" />; }
    if (user.firstTimeLogin) { return <Navigate to="/reset-password" />; }
    return children;
};

function App() {
    const [, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) { setUser(JSON.parse(storedUser)); }
    }, []);

    // --- UPDATED to include ROLE_EMPLOYEE ---
    const handleLoginSuccess = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        if (userData.firstTimeLogin) { navigate('/reset-password'); return; }
        
        if (userData.roles.includes('ROLE_ADMIN')) {
            navigate('/admin/dashboard');
        } else if (userData.roles.includes('ROLE_HR') || userData.roles.includes('ROLE_MANAGER')) {
            navigate('/dashboard/home');
        } else if (userData.roles.includes('ROLE_EMPLOYEE')) {
            navigate('/employee/leave'); // Direct employee to their leave page
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => { /* ... This function is correct ... */ };

    return (
        <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/reset-password" element={<ResetPasswordPage onPasswordResetSuccess={handleLogout} />} />

            {/* --- ADMIN DASHBOARD ROUTES --- */}
            <Route
                path="/admin/*"
                element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminLayout /></ProtectedRoute>}
            >
                <Route path="dashboard" element={<AdminHomePage />} />
                <Route path="manage-users" element={<ManageUsersPage />} />
                <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* --- UNIFIED HR & MANAGER DASHBOARD ROUTES --- */}
            <Route
                path="/dashboard/*"
                element={<ProtectedRoute allowedRoles={['ROLE_HR', 'ROLE_MANAGER']}><DashboardLayout /></ProtectedRoute>}
            >
                <Route path="home" element={<DashboardHomePage />} />
                <Route path="employees" element={<EmployeeListPage />} />
                <Route path="onboard" element={<OnboardingPage />} />
                <Route path="leave" element={<ProtectedRoute allowedRoles={['ROLE_MANAGER']}><LeaveManagementPage /></ProtectedRoute>} />
                <Route path="approve-leave" element={<ProtectedRoute allowedRoles={['ROLE_MANAGER']}><LeaveApprovalPage /></ProtectedRoute>} />
                <Route index element={<Navigate to="home" />} />
            </Route>

            {/* +++ NEW AND CORRECTLY PLACED EMPLOYEE DASHBOARD ROUTES +++ */}
            <Route
                path="/employee/*"
                element={
                    <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE']}>
                        <EmployeeLayout />
                    </ProtectedRoute>
                }
            >
                {/* The employee's main page is their leave management page */}
                <Route path="leave" element={<LeaveManagementPage />} />
                {/* Redirects /employee to /employee/leave by default */}
                <Route index element={<Navigate to="leave" />} />
            </Route>

            {/* --- DEFAULT CATCH-ALL ROUTE --- */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;