import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2'; // <-- 1. IMPORT SWEETALERT2
import withReactContent from 'sweetalert2-react-content'; // Optional, but good practice

import { getManageableUsers, updateUserStatus, createUser } from '../services/api';
import '../components/Modal.css';
import '../components/Table.css';

// Create a SweetAlert2 instance that can be used with React components
const MySwal = withReactContent(Swal);
Modal.setAppElement('#root');

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // Keep top-level error for fetch fail
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'ROLE_HR' });

    // --- We no longer need these states, SweetAlert2 will handle feedback ---
    // const [formError, setFormError] = useState('');
    // const [formSuccess, setFormSuccess] = useState('');

    const fetchUsers = () => {
        setIsLoading(true);
        getManageableUsers()
            .then(response => setUsers(response.data))
            .catch(err => setError('Failed to load users. Please try again later.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    // --- UPGRADED: Event handler for enabling/disabling a user ---
    const handleStatusToggle = (user) => {
        const newStatus = !user.enabled;
        const actionText = newStatus ? 'Enable' : 'Disable';

        MySwal.fire({
            title: `Confirm Action`,
            html: `Are you sure you want to <strong>${actionText}</strong> the user "<strong>${user.username}</strong>"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${actionText} it!`,
            cancelButtonText: 'No, cancel',
            confirmButtonColor: newStatus ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
           customClass: {
  confirmButton: 'btn btn-success',
  cancelButton: 'btn btn-secondary ms-2'
},
buttonsStyling: false,

 // Use Bootstrap classes for buttons
        }).then((result) => {
            if (result.isConfirmed) {
                updateUserStatus(user.id, newStatus)
                    .then(() => {
                        MySwal.fire(
                            `${actionText}d!`,
                            `User "${user.username}" has been successfully ${actionText.toLowerCase()}d.`,
                            'success'
                        );
                        fetchUsers(); // Refresh the list
                    })
                    .catch(err => {
                        MySwal.fire(
                            'Action Failed!',
                            'Could not update the user status.',
                            'error'
                        );
                    });
            }
        });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewUser({ username: '', email: '', password: '', role: 'ROLE_HR' });
    };

    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    // --- UPGRADED: Event handler for creating a new user ---
    const handleCreateUserSubmit = (e) => {
        e.preventDefault();

        createUser(newUser.username, newUser.password, newUser.role, newUser.email)
            .then(() => {
                closeModal(); // Close the form modal immediately on success
                MySwal.fire({
                    icon: 'success',
                    title: 'User Created!',
                    text: `The account for "${newUser.username}" has been successfully created.`,
                    timer: 2500,
                    showConfirmButton: false,
                });
                fetchUsers(); // Refresh the table in the background
            })
            .catch(err => {
                // Show an error pop-up. It will appear on top of the modal.
                MySwal.fire({
                    icon: 'error',
                    title: 'Creation Failed',
                    text: err.response?.data || 'An unknown error occurred. Please check the details and try again.',
                });
            });
    };

    if (isLoading) return <p>Loading users...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            {/* --- Header Section (No changes needed) --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #dee2e6' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Manage Users</h2>
                <button onClick={openModal} className="btn btn-header">+ Create New User</button>
            </div>

            {/* --- Table Section (Updated onClick handler) --- */}
            <table className="app-table">
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email || 'N/A'}</td>
                            <td>{user.role.replace('ROLE_', '')}</td>
                            <td><span style={{ fontWeight: 'bold', color: user.enabled ? '#28a745' : '#dc3545' }}>{user.enabled ? 'Active' : 'Disabled'}</span></td>
                            <td>
                                <button onClick={() => handleStatusToggle(user)} className={`action-button ${user.enabled ? 'btn-disable' : 'btn-enable'}`}>
                                    {user.enabled ? 'Disable' : 'Enable'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- Create User Modal (No longer needs error/success paragraphs) --- */}
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-content" overlayClassName="modal-overlay">
                <h2>Create New User</h2>
                <button onClick={closeModal} className="modal-close-button">×</button>
                <form onSubmit={handleCreateUserSubmit}>
                    <div className="form-group"><label>Username</label><input type="text" name="username" value={newUser.username} onChange={handleNewUserChange} required /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} required /></div>
                    <div className="form-group"><label>Temporary Password</label><input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} required minLength="6" /></div>
                    <div className="form-group"><label>Role</label><select name="role" value={newUser.role} onChange={handleNewUserChange}><option value="ROLE_HR">HR</option><option value="ROLE_MANAGER">Manager</option></select></div>
                    <button type="submit" className="btn">Submit Creation</button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageUsersPage;