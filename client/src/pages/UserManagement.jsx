import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../context/AuthContext';
import './UserManagement.css';

export default function UserManagement() {
    const { session } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            console.log('🔍 Fetching users from Supabase...');
            // Fetch directly from Supabase profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, role, updated_at')
                .order('updated_at', { ascending: false });

            console.log('📊 Supabase response:', { data, error });

            if (error) throw error;

            console.log('✅ Users fetched:', data);
            setUsers(data || []);
        } catch (err) {
            console.error('❌ Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Refresh users list
            fetchUsers();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const getRoleBadgeClass = (role) => {
        const roleClasses = {
            admin: 'role-badge-admin',
            manager: 'role-badge-manager',
            user: 'role-badge-user',
            viewer: 'role-badge-viewer'
        };
        return roleClasses[role] || '';
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-management">
            <div className="user-management-header">
                <h1>User Management</h1>
                <p>Manage user roles and permissions</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="user-management-controls">
                <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <div className="user-count">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Role</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username || 'N/A'}</td>
                                <td>{user.full_name || 'N/A'}</td>
                                <td>
                                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="user">User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="no-users">
                    <p>No users found</p>
                </div>
            )}
        </div>
    );
}
