import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './IncidentReport.css';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

// Department and Location values from SQL CHECK constraints
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
    'Chemical Mixing', 'Production Floor B', 'Training Room', 'Packaging Line', 'Cafeteria',
    'Waste Storage', 'Production Floor A', 'Outdoor Storage', 'Conveyor System',
    'Cooling System', 'Robotic Assembly', 'Warehouse A', 'Parking Lot B', 'Electrical Room'
];

export default function IncidentReport() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        category: 'safety',
        severity: 'medium',
        location: '',
        department: '',
        description: '',
        immediateAction: '',
        reportedBy: '',
        assignedTo: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (user?.id && !formData.reportedBy) {
            setFormData(prev => ({ ...prev, reportedBy: user.id }));
        }
    }, [user]);

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            setToast({ message: 'You must be logged in to report an incident', type: 'error' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);

        try {
            const incidentData = {
                category: formData.category,
                severity: formData.severity,
                location: formData.location,
                department: formData.department,
                description: formData.description,
                immediate_action: formData.immediateAction,
                status: 'open',
                user_id: user.id,
                reported_by: formData.reportedBy || user.id
            };

            const { data: incident, error: incidentError } = await supabase
                .from('incidents')
                .insert([incidentData])
                .select()
                .single();

            if (incidentError) throw incidentError;

            // If assigned to someone, create a corrective action
            if (formData.assignedTo) {
                const correctiveActionData = {
                    incident_id: incident.id,
                    assigned_to: formData.assignedTo,
                    status: 'pending'
                };

                const { error: actionError } = await supabase
                    .from('corrective_actions')
                    .insert([correctiveActionData]);

                if (actionError) {
                    console.error('Error creating corrective action:', actionError);
                }
            }

            setToast({ message: 'Incident reported successfully', type: 'success' });
            setTimeout(() => navigate('/incidents'), 1500);
        } catch (error) {
            console.error('Error creating incident:', error);
            setToast({ message: `Failed to create incident: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="incident-report fade-in">
                <div className="report-header">
                    <div>
                        <h1>Report Incident</h1>
                        <p className="text-muted">Document safety, quality, or environmental incidents</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="report-form card">
                    <div className="form-section">
                        <h3>Incident Details</h3>

                        <div className="form-grid grid grid-2">
                            <div className="form-group">
                                <label>Reported By *</label>
                                <select name="reportedBy" value={formData.reportedBy} onChange={handleChange} required>
                                    <option value="">Select reporter...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.full_name || u.username || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Assigned To</label>
                                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
                                    <option value="">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.full_name || u.username || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="safety">Safety</option>
                                    <option value="quality">Quality</option>
                                    <option value="environmental">Environmental</option>
                                    <option value="equipment">Equipment</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Severity *</label>
                                <select name="severity" value={formData.severity} onChange={handleChange} required>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Department *</label>
                                <select name="department" value={formData.department} onChange={handleChange} required>
                                    <option value="">Select department...</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Location *</label>
                                <select name="location" value={formData.location} onChange={handleChange} required>
                                    <option value="">Select location...</option>
                                    {LOCATIONS.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Provide detailed description of the incident..."
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Immediate Action Taken</label>
                            <textarea
                                name="immediateAction"
                                value={formData.immediateAction}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe any immediate corrective actions..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Evidence (Optional)</h3>
                        <div className="upload-area">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload photos or drag and drop</p>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>PNG, JPG up to 10MB</p>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <span>✓</span>
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
