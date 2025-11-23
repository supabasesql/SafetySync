import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ children, allowedRoles }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!profile || !allowedRoles.includes(profile.role)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                gap: '1rem'
            }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p>Required role: {allowedRoles.join(' or ')}</p>
                <p>Your role: {profile?.role || 'None'}</p>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return children;
}
