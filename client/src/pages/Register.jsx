import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Attempting sign up with:', email);
        try {
            const { user, session } = await signUp(email, password);
            console.log('Sign up successful. User:', user, 'Session:', session);
            setSuccess(true);
        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message || 'Failed to register');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container register-mode">
                <div className="auth-card register-card">
                    <div className="auth-header">
                        <h1>Check your email</h1>
                        <p>We've sent a confirmation link to <strong>{email}</strong></p>
                    </div>
                    <div className="auth-success-message">
                        <div className="success-icon">✉️</div>
                        <p>Please click the link in the email to verify your account and sign in.</p>
                    </div>
                    <div className="auth-footer">
                        <Link to="/login" className="btn btn-primary btn-block">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container register-mode">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join SafetySync today</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className="btn btn-register btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="link-primary">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
