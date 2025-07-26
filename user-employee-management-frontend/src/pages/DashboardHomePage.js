import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import Card from '../components/Card';
import ClockWidget from '../components/ClockWidget';

const DashboardHomePage = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username || 'User';

    useEffect(() => {
        getDashboardStats()
            .then(response => {
                setStats(response.data);
            })
            .catch(err => {
                setError('Failed to load dashboard data.');
                console.error(err);
});
    }, []);

    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            {/* --- Welcome Header --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>PayFlow Dashboard</h1>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '1.1rem' }}>
                        Welcome, {username}! Here is your employee summary.
                    </p>
                </div>
                <ClockWidget />
            </div>

            {/* --- Stats Cards Section --- */}
            <div className="form-container">
                 <h2 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>Employee Overview</h2>
                {!stats ? <p>Loading statistics...</p> : (
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <Card title="Total Employees" value={stats.totalEmployees} />
                        <Card title="Active Employees" value={stats.activeEmployees} />
                        
                        {/* --- THIS IS THE FIX --- */}
                        {/* 1. The title is updated to "Pending Leave Requests". */}
                        {/* 2. The value now reads from the new 'pendingLeaveRequests' property. */}
                        <Card title="Pending Leave Requests" value={stats.pendingLeaveRequests} />

                        <Card title="On Probation" value={stats.onProbationEmployees} />
                        <Card title="New This Month" value={stats.newThisMonth} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHomePage;