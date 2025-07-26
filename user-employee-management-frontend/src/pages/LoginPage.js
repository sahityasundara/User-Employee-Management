import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { login } from '../services/api';

const MySwal = withReactContent(Swal);

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // We no longer need the 'error' state, SweetAlert2 will handle it
    // const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            MySwal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Username and password are required.',
            });
            return;
        }
        
        
        MySwal.fire({
            title: 'Logging In...',
            text: 'Please wait while we verify your credentials.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await login(username, password);
            MySwal.close(); 
            onLoginSuccess(response.data);
        } catch (err) {
            MySwal.close(); 
           
            MySwal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Please check your credentials and try again.',
                customClass: {
                    confirmButton: 'btn btn-danger me-2'
                },
                buttonsStyling: false
            });
            console.error(err);
        }
    };

    return (
        <div className="form-container">
            <h1>PayFlow Login</h1>
            {/* The old error message paragraph is no longer needed */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="form-control" // Bootstrap class
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control" // Bootstrap class
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;