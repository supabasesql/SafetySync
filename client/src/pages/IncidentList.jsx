import { useState, useEffect } from 'react';
import './IncidentList.css';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function IncidentList() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedIncident, setSelectedIncident] = useState(null);
    const { profile } = useAuth();

    useEffect(() => {
        fetchIncidents();
    }, [profile]);

    const fetchIncidents = async () => {
        try {
            let query = supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false });

            // If user role is 'user', only show their incidents
            if (profile?.role === 'user') {
                query = query.eq('user_id', profile.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            setIncidents(data || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredIncidents = filter === 'all'
        ? incidents
        : incidents.filter(i => i.status === filter);

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('incidents')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Refresh incidents
            fetchIncidents();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return <div className="incident-list"><p>Loading...</p></div>;
    }

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'danger',
            high: 'warning',
            medium: 'info',
            low: 'success'
        };
        return colors[severity] || 'info';
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'danger',
            'in-progress': 'warning',
            resolved: 'success',
            closed: 'info'
        };
        return colors[status] || 'info';
    };

    return (
        <div className="incident-list fade-in">
            <div className="list-header">
                <div>
                    <h1>Incident Management</h1>
                    <p className="text-muted">Track and manage all reported incidents</p>
                </div>
            </div>

            <div className="filters card mb-lg">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({incidents.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
                        onClick={() => setFilter('open')}
                    >
                        Open ({incidents.filter(i => i.status === 'open').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in-progress')}
                    >
                        In Progress ({incidents.filter(i => i.status === 'in-progress').length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved ({incidents.filter(i => i.status === 'resolved').length})
                    </button>
                </div>
            </div>

            {filteredIncidents.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <span style={{ fontSize: '3rem' }}>📋</span>
                        <p className="text-muted">No incidents found</p>
                    </div>
                </div>
            ) : (
                <div className="incidents-grid">
                    {filteredIncidents.map(incident => (
                        <div key={incident.id} className="incident-card card">
                            <div className="incident-card-header">
                                <div className="incident-id">#{incident.id.toString().slice(-4)}</div>
                                <div className="incident-badges">
                                    <span className={`badge badge-${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                    </span>
                                    <span className={`badge badge-${getStatusColor(incident.status)}`}>
                                        {incident.status}
                                    </span>
                                </div>
                            </div>

                            <div className="incident-card-body">
                                <h4>{incident.category}</h4>
                                <p className="incident-description">{incident.description}</p>

                                <div className="incident-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Location:</span>
                                        <span>{incident.location}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Department:</span>
                                        <span>{incident.department}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Reported:</span>
                                        <span>{new Date(incident.created_at || incident.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="incident-card-actions">
                                <select
                                    value={incident.status}
                                    onChange={(e) => updateStatus(incident.id, e.target.value)}
                                    className="status-select"
                                >
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSelectedIncident(incident)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for incident details */}
            {selectedIncident && (
                <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Incident Details</h2>
                            <button className="modal-close" onClick={() => setSelectedIncident(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="detail-row">
                                    <span className="detail-label">Incident ID:</span>
                                    <span className="detail-value">#{selectedIncident.id.toString().slice(-8)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Category:</span>
                                    <span className="detail-value">{selectedIncident.category}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Severity:</span>
                                    <span className={`badge badge-${getSeverityColor(selectedIncident.severity)}`}>
                                        {selectedIncident.severity}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`badge badge-${getStatusColor(selectedIncident.status)}`}>
                                        {selectedIncident.status}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-row">
                                    <span className="detail-label">Location:</span>
                                    <span className="detail-value">{selectedIncident.location}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Department:</span>
                                    <span className="detail-value">{selectedIncident.department}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Reported:</span>
                                    <span className="detail-value">
                                        {new Date(selectedIncident.created_at || selectedIncident.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Description</h4>
                                <p className="detail-text">{selectedIncident.description}</p>
                            </div>

                            {selectedIncident.immediate_action && (
                                <div className="detail-section">
                                    <h4>Immediate Action Taken</h4>
                                    <p className="detail-text">{selectedIncident.immediate_action}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedIncident(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
