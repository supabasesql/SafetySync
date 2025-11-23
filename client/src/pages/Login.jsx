import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Attempting login with:', email);

        try {
            const result = await signIn(email, password);
            console.log('Login successful:', result);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container login-mode">
            <div className="auth-card login-card">
                <div className="auth-header">
                    <h1>SafetySync</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

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
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="form-footer">
                        <Link to="/forgot-password" className="link-secondary">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="link-primary">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
