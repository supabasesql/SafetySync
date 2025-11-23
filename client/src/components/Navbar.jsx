import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ currentPage }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, profile, canManageUsers, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <Link to="/" className="brand-logo">
                        <span className="logo-icon">🛡️</span>
                        SafetySync
                    </Link>
                </div>

                <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}>
                                Dashboard
                            </Link>
                            <Link to="/incidents" className={`nav-item ${currentPage === 'incidents' ? 'active' : ''}`}>
                                Incidents
                            </Link>
                            <Link to="/report" className={`nav-item ${currentPage === 'report' ? 'active' : ''}`}>
                                Report
                            </Link>
                            <Link to="/analytics" className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}>
                                Analytics
                            </Link>
                            {canManageUsers() && (
                                <Link to="/admin/users" className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}>
                                    Users
                                </Link>
                            )}
                        </>
                    ) : (
                        // Public links if any, or just home
                        <Link to="/" className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}>
                            Home
                        </Link>
                    )}
                </div>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-menu">
                            <Link to="/profile" className="user-profile-link">
                                <div className="user-avatar">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                {profile && (
                                    <span className={`user-role-badge role-${profile.role}`}>
                                        {profile.role}
                                    </span>
                                )}
                            </Link>
                            <button className="btn btn-sm btn-outline" onClick={handleSignOut}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Sign Up</Link>
                        </div>
                    )}

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="hamburger"></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
