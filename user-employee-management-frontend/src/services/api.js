import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers['Authorization'] = 'Bearer ' + user.token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- AUTH SERVICE ---
export const login = (username, password) => {
    return api.post('/auth/login', { username, password });
};

export const resetPassword = (newPassword) => {
    return api.post('/auth/reset-password', { newPassword });
};


// --- ADMIN SERVICE ---
export const getAdminDashboardStats = () => {
    return api.get('/admin/dashboard/stats');
};

export const getManageableUsers = () => {
    return api.get('/admin/users');
};

export const updateUserStatus = (userId, isEnabled) => {
    return api.put(`/admin/users/${userId}/status`, { enabled: isEnabled });
};

export const createUser = (username, password, role, email) => {
    return api.post('/admin/users', { username, email, password, role });
};


// --- UNIFIED HR & MANAGER SERVICE ---
export const getDashboardStats = () => {
    return api.get('/dashboard/stats');
};

export const getEmployees = (params) => {
    return api.get('/dashboard/employees', { params });
};

export const onboardEmployee = (employeeData) => {
    return api.post('/dashboard/employees', employeeData);
};

export const updateEmployee = (employeeId, employeeData) => {
    return api.put(`/dashboard/employees/${employeeId}`, employeeData);
};

// +++ THIS IS THE MISSING FUNCTION +++
/**
 * Sends a request to delete an employee by their ID.
 * @param {number} employeeId The ID of the employee to delete.
 */
export const deleteEmployee = (employeeId) => {
    return api.delete(`/dashboard/employees/${employeeId}`);
};
export const getMyLeaveBalances = () => api.get('/leave/my-balances');
export const getMyLeaveRequests = () => api.get('/leave/my-requests');
export const submitLeaveRequest = (requestData) => api.post('/leave/requests', requestData);
export const getPendingLeaveRequests = () => api.get('/leave/requests/pending');
export const updateLeaveRequestStatus = (requestId, newStatus) => api.put(`/leave/requests/${requestId}/status`, { status: newStatus });

export default api;


