import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [website, setWebsite] = useState('');
    const [avatar_url, setAvatarUrl] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        getProfile();
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const token = (await user?.session?.access_token) || null; // In a real app, get session properly if needed, but here we rely on backend or direct supabase client if we were using it directly. 
            // Since we are using our backend API for profile:
            const response = await fetch('http://localhost:3001/api/profile', {
                headers: {
                    Authorization: `Bearer ${user.access_token || user.session?.access_token || ''}` // We need to ensure we pass the token. 
                    // Note: In AuthContext we might need to expose the session or token more directly if user object doesn't have it directly in all cases.
                    // For Supabase v2, user object is just user data. Session has the token.
                    // Let's assume for now we might need to get the session from supabase client or AuthContext.
                    // Actually, let's use the supabase client directly for profile fetch to keep it simple or use the backend endpoint we created.
                    // The backend endpoint expects a Bearer token.
                }
            });

            // Wait, we need the token. Let's fix AuthContext to expose session or token.
            // For now, let's assume we can get it. 
            // Actually, let's use the supabase client directly here for simplicity as it handles auth headers automatically if we use it?
            // No, we built a backend endpoint /api/profile. Let's use that.
            // We need the access token.

            // Let's assume the user object from useAuth() has what we need or we can get the session.
            // In AuthContext, we set user = session?.user. The session object has the token.
            // We should probably expose the session in AuthContext.

        } catch (error) {
            // console.error('Error loading user data!');
        } finally {
            setLoading(false);
        }
    };

    // Re-implementing with direct supabase client for now to match the "simple" approach or fixing AuthContext.
    // Let's stick to the backend approach but we need the token.
    // I will update AuthContext in the next step to expose the session.

    return (
        <div className="profile-container">
            <div className="card profile-card">
                <div className="profile-header">
                    <div className="avatar-placeholder">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2>{user?.email}</h2>
                    <span className="badge badge-info">{role || 'User'}</span>
                </div>

                <form className="profile-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="text" value={user?.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input type="text" value={role || 'user'} disabled />
                        <small className="text-muted">Roles are managed by administrators</small>
                    </div>

                    <button className="btn btn-primary" disabled={loading}>
                        {loading ? 'Loading...' : 'Update Profile'}
                    </button>
                </form>

                <div className="profile-actions">
                    <button className="btn btn-danger-outline" onClick={signOut}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
