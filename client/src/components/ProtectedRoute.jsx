import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a route element and redirects to /login if no user is authenticated
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // You could render a spinner here
        return <div className="loading">Loading...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
};
