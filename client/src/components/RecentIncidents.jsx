import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RecentIncidents.css';
import { supabase } from '../context/AuthContext';

// Listes de valeurs pour les dropdowns
const DEPARTMENTS = [
    'Production', 'R&D', 'Operations', 'Maintenance', 'Manufacturing',
    'Procurement', 'Building Services', 'Administration', 'IT', 'Security',
    'Logistics', 'Facilities', 'HR', 'QA', 'EHS', 'QC', 'Receiving', 'Food Services'
];

const LOCATIONS = [
    'Storm Drains', 'Elevator System', 'Break Room', 'Assembly Line 3', 'Stairwell',
    'Grounds', 'Hydraulic Press', 'HVAC System', 'Paint Booth', 'Shipping',
    'Testing Lab', 'Welding Area', 'Workshop Area', 'Roof Area', 'Parking Structure',
    'Inspection Station 2', 'Office Area', 'Warehouse B', 'Inspection Area', 'Quality Lab',
    'Loading Bay', 'Office Building C', 'Assembly Line 1', 'PA 1', 'Office Printer Room',
    'Welding Station', 'Stairwell B', 'Chemical Lab', 'Chemical Storage', 'Confined Space',
    'Warehouse Entrance', 'Production Floor 2', 'Assembly Line 2', 'Incoming Inspection',
    'Loading Dock', 'Waste Processing', 'Conference Room', 'Quality Control Lab',
    'Packaging Line 1', 'Final Inspection', 'Paint Shop', 'Warehouse C', 'Production Floor 1',
    'Compressor Room', 'Tool Crib', 'Final Assembly', 'Sterile Room', 'Packaging',
    'Boiler Room', 'CNC Machine Shop', 'Power Distribution', 'Loading Dock 4',
    'Shipping Department', 'Wastewater System', 'Restroom Facilities', 'Raw Materials',
    'Wastewater Treatment', 'Warehouse Zone A', 'Parking Lot', 'Process Control',
    'Chemical Mixing', 'Production Floor B', 'Training Room', 'Packaging Line',
    'Cafeteria', 'Waste Storage', 'Production Floor A', 'Outdoor Storage',
    'Conveyor System', 'Cooling System', 'Robotic Assembly', 'Warehouse A',
    'Parking Lot B', 'Electrical Room'
];

const CATEGORIES = ['safety', 'quality', 'environmental', 'equipment'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

export default function RecentIncidents({ incidents = [], onRefresh }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [editingIncident, setEditingIncident] = useState(null);
    const [users, setUsers] = useState([]);
    const [editForm, setEditForm] = useState({
        department: '',
        location: '',
        category: '',
        severity: '',
        status: '',
        assigned_to: '',
        action_description: '',
        due_date: ''
    });
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, username')
                .order('full_name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAssignmentChange = async (incident, newAssignedTo) => {
        try {
            if (newAssignedTo === '') {
                // Unassign - delete corrective action and set status to open
                if (incident.action_id) {
                    await supabase.from('corrective_actions').delete().eq('id', incident.action_id);
                }
                // Always set status to open when unassigning
                await supabase.from('incidents').update({ status: 'open' }).eq('id', incident.id);
            } else {
                // Update incident status to in-progress ONLY if currently open
                if (incident.status === 'open') {
                    await supabase.from('incidents').update({ status: 'in-progress' }).eq('id', incident.id);
                }

                if (incident.action_id) {
                    // Update existing corrective action
                    await supabase.from('corrective_actions').update({ assigned_to: newAssignedTo }).eq('id', incident.action_id);
                } else {
                    // Create new corrective action
                    await supabase.from('corrective_actions').insert([{
                        incident_id: incident.id,
                        assigned_to: newAssignedTo,
                        status: 'pending'
                    }]);
                }
            }
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating assignment:', error);
            alert(`Failed to update assignment: ${error.message}`);
        }
    };

    const handleFieldChange = async (incident, field, value) => {
        try {
            await supabase.from('incidents').update({ [field]: value }).eq('id', incident.id);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            alert(`Failed to update ${field}: ${error.message}`);
        }
    };

    const handleEditClick = async (incident) => {
        try {
            const { data: actionData } = await supabase
                .from('corrective_actions')
                .select('*')
                .eq('incident_id', incident.id)
                .maybeSingle();

            setEditingIncident(incident);
            setEditForm({
                department: incident.department || '',
                location: incident.location || '',
                category: incident.category || '',
                severity: incident.severity || '',
                status: incident.status || '',
                assigned_to: actionData?.assigned_to || '',
                action_description: actionData?.action_description || '',
                due_date: actionData?.due_date || ''
            });
        } catch (error) {
            console.error('Error loading incident:', error);
        }
    };

    const handleSaveEdit = async () => {
        try {
            // Update incident
            await supabase.from('incidents').update({
                department: editForm.department,
                location: editForm.location,
                category: editForm.category,
                severity: editForm.severity,
                status: editForm.status
            }).eq('id', editingIncident.id);

            // Update or create corrective action
            const { data: existingAction } = await supabase
                .from('corrective_actions')
                .select('id')
                .eq('incident_id', editingIncident.id)
                .maybeSingle();

            if (existingAction) {
                await supabase.from('corrective_actions').update({
                    assigned_to: editForm.assigned_to || null,
                    action_description: editForm.action_description || null,
                    due_date: editForm.due_date || null
                }).eq('id', existingAction.id);
            } else if (editForm.assigned_to || editForm.action_description || editForm.due_date) {
                await supabase.from('corrective_actions').insert([{
                    incident_id: editingIncident.id,
                    assigned_to: editForm.assigned_to || null,
                    action_description: editForm.action_description || null,
                    due_date: editForm.due_date || null,
                    status: 'pending'
                }]);
            }

            setEditingIncident(null);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error saving:', error);
            alert(`Failed to save: ${error.message}`);
        }
    };

    const currentIncidents = incidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(incidents.length / itemsPerPage);

    const getSeverityColor = (severity) => ({
        critical: 'danger', high: 'warning', medium: 'info', low: 'success'
    }[severity] || 'info');

    const getStatusColor = (status) => ({
        open: 'danger', 'in-progress': 'warning', resolved: 'success', closed: 'info'
    }[status] || 'info');

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    };

    if (incidents.length === 0) {
        return (
            <div className="card">
                <h3>Recent Incidents</h3>
                <div className="empty-state">
                    <span style={{ fontSize: '3rem' }}>📋</span>
                    <p className="text-muted">No incidents reported yet</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="flex justify-between items-center mb-lg">
                    <h3>Recent Incidents ({incidents.length})</h3>
                    <Link to="/incidents" className="btn btn-secondary">View All →</Link>
                </div>

                <div className="incidents-table-wrapper">
                    <table className="incidents-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Date</th><th>Reported By</th><th>Assigned To</th>
                                <th>Department</th><th>Location</th><th>Category</th>
                                <th>Severity</th><th>Status</th><th>Due Date</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentIncidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td className="incident-id">#{incident.id.toString().slice(-4)}</td>
                                    <td>{new Date(incident.created_at).toLocaleDateString()}</td>
                                    <td>{incident.reported_by_name || 'N/A'}</td>
                                    <td>
                                        <select value={incident.assigned_to || ''} onChange={(e) => handleAssignmentChange(incident, e.target.value)} className="assignment-select">
                                            <option value="">Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                                        </select>
                                    </td>
                                    <td>{incident.department}</td>
                                    <td>{incident.location}</td>
                                    <td><span className="badge badge-info">{incident.category}</span></td>
                                    <td><span className={`badge badge-${getSeverityColor(incident.severity)}`}>{incident.severity}</span></td>
                                    <td>
                                        <select value={incident.status} onChange={(e) => handleFieldChange(incident, 'status', e.target.value)} className="assignment-select">
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        {incident.due_date ? (
                                            <span style={{ color: isOverdue(incident.due_date) ? '#ef4444' : 'inherit', fontWeight: isOverdue(incident.due_date) ? '600' : 'normal' }}>
                                                {new Date(incident.due_date).toLocaleDateString()}
                                                {isOverdue(incident.due_date) && ' ⚠️'}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-icon" onClick={() => setSelectedIncident(incident)} title="View details">👁️</button>
                                            <button className="btn-icon" onClick={() => handleEditClick(incident)} title="Edit incident">✏️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
                        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {selectedIncident && (
                <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
                    <div className="modal-content incident-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Incident Details</h2>
                            <button className="modal-close" onClick={() => setSelectedIncident(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item"><span className="detail-label">ID:</span><span className="detail-value">#{selectedIncident.id.toString().slice(-8)}</span></div>
                                <div className="detail-item"><span className="detail-label">Date:</span><span className="detail-value">{new Date(selectedIncident.created_at).toLocaleString()}</span></div>
                                <div className="detail-item"><span className="detail-label">Reported By:</span><span className="detail-value">{selectedIncident.reported_by_name || 'N/A'}</span></div>
                                <div className="detail-item"><span className="detail-label">Assigned To:</span><span className="detail-value">{selectedIncident.assigned_to_name || 'Unassigned'}</span></div>
                                <div className="detail-item"><span className="detail-label">Department:</span><span className="detail-value">{selectedIncident.department}</span></div>
                                <div className="detail-item"><span className="detail-label">Location:</span><span className="detail-value">{selectedIncident.location}</span></div>
                                <div className="detail-item"><span className="detail-label">Category:</span><span className="badge badge-info">{selectedIncident.category}</span></div>
                                <div className="detail-item"><span className="detail-label">Severity:</span><span className={`badge badge-${getSeverityColor(selectedIncident.severity)}`}>{selectedIncident.severity}</span></div>
                                <div className="detail-item"><span className="detail-label">Status:</span><span className={`badge badge-${getStatusColor(selectedIncident.status)}`}>{selectedIncident.status}</span></div>
                            </div>
                            <div className="detail-section"><h4>Description</h4><p className="detail-text">{selectedIncident.description}</p></div>
                            {selectedIncident.immediate_action && <div className="detail-section"><h4>Immediate Action</h4><p className="detail-text">{selectedIncident.immediate_action}</p></div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedIncident(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingIncident && (
                <div className="modal-overlay" onClick={() => setEditingIncident(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Edit Incident</h2>
                            <button className="modal-close" onClick={() => setEditingIncident(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Incident Details</h3>
                            <div className="form-grid grid grid-2">
                                <div className="form-group">
                                    <label>Department *</label>
                                    <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} required>
                                        <option value="">Select...</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location *</label>
                                    <select value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required>
                                        <option value="">Select...</option>
                                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required>
                                        <option value="">Select...</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Severity *</label>
                                    <select value={editForm.severity} onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })} required>
                                        <option value="">Select...</option>
                                        {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status *</label>
                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} required>
                                        <option value="">Select...</option>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned To</label>
                                    <select value={editForm.assigned_to} onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}>
                                        <option value="">Unassigned</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                                    </select>
                                </div>
                            </div>
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Corrective Action</h3>
                            <div className="form-group">
                                <label>Action Description</label>
                                <textarea value={editForm.action_description} onChange={(e) => setEditForm({ ...editForm, action_description: e.target.value })} rows="4" placeholder="Describe corrective action..." />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingIncident(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
