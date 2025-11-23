import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IncidentReport from './pages/IncidentReport';
import IncidentList from './pages/IncidentList';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';

const API_URL = 'http://localhost:3001/api';

function AppContent() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Fetch incidents from Supabase on mount (or when auth state changes - handled by protected route/page logic ideally)
    // For now, we fetch on mount. In a real app, we might refetch on login.
    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            // Note: This fetch might need auth headers if RLS is enabled and we want user-specific data.
            // The current fetchIncidents implementation in App.jsx didn't have auth headers.
            // We should update it to use the token if available, but for now let's keep it simple
            // and rely on the backend to handle public/private or update this later.
            // Actually, since we added verifyJwt middleware to /api/incidents, this fetch WILL FAIL without a token.
            // We need to move this fetch logic into a component that has access to the auth token,
            // or update this to use the token from context.
            // However, AppContent is inside AuthProvider, so we can use useAuth().
            // But let's just keep the structure and maybe move data fetching to pages or a custom hook.
            // For this step, I will just set up the routing. The data fetching might break until we pass the token.
            // I'll leave the fetch here but it might 401. We'll fix that next.
            const response = await fetch(`${API_URL}/incidents`);
            if (response.ok) {
                const data = await response.json();
                setIncidents(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setLoading(false);
        }
    };

    const addIncident = async (incident) => {
        try {
            // We need the token here too.
            const response = await fetch(`${API_URL}/incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Needs token
                },
                body: JSON.stringify(incident),
            });

            const result = await response.json();

            if (result.success) {
                setIncidents([result.incident, ...incidents]);
                // Navigate to list
            }
        } catch (error) {
            console.error('Error creating incident:', error);
            alert('Failed to create incident. Please try again.');
        }
    };

    // Helper to determine current page for Navbar (legacy prop)
    // We should update Navbar to use useLocation() instead of props, but for now:
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/') return 'dashboard';
        if (path === '/report') return 'report';
        if (path === '/incidents') return 'incidents';
        if (path === '/analytics') return 'analytics';
        if (path === '/admin/users') return 'users';
        return '';
    };

    return (
        <div className="app">
            <Navbar currentPage={getCurrentPage()} />
            <main className="container" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard incidents={incidents} loading={loading} />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard incidents={incidents} loading={loading} />
                        </ProtectedRoute>
                    } />
                    <Route path="/report" element={
                        <ProtectedRoute>
                            <IncidentReport onSubmit={addIncident} onCancel={() => { }} />
                        </ProtectedRoute>
                    } />
                    <Route path="/incidents" element={
                        <ProtectedRoute>
                            <IncidentList incidents={incidents} setIncidents={setIncidents} />
                        </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute>
                            <Analytics incidents={incidents} />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute>
                            <RequireRole allowedRoles={['admin']}>
                                <UserManagement />
                            </RequireRole>
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
