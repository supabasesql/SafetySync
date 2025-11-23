import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import KPICard from '../components/KPICard';
import RecentIncidents from '../components/RecentIncidents';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import SafetyCalendar from '../components/SafetyCalendar';

export default function Dashboard() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const { profile } = useAuth();

    useEffect(() => {
        fetchIncidents();
    }, [profile]);

    useEffect(() => {
        console.log('📅 Selected Date:', selectedDate);
    }, [selectedDate]);

    const fetchIncidents = async () => {
        try {
            console.log('🔍 Fetching incidents for dashboard...');

            // Fetch incidents
            let query = supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false });

            // If user role is 'user', only show their incidents
            if (profile?.role === 'user') {
                query = query.eq('user_id', profile.id);
            }

            const { data: incidentsData, error: incidentsError } = await query;

            if (incidentsError) throw incidentsError;

            console.log('📊 Incidents fetched:', incidentsData?.length);

            if (!incidentsData || incidentsData.length === 0) {
                setIncidents([]);
                setLoading(false);
                return;
            }

            // Fetch all profiles for user names
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, username');

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError);
            }

            // Fetch corrective actions for assignments
            const { data: actionsData, error: actionsError } = await supabase
                .from('corrective_actions')
                .select('incident_id, assigned_to, id, due_date');

            if (actionsError) {
                console.error('Error fetching corrective actions:', actionsError);
            }

            // Create a map of user IDs to names
            const userMap = {};
            (profilesData || []).forEach(p => {
                userMap[p.id] = p.full_name || p.username || 'Unknown';
            });

            // Create a map of incident IDs to assigned users
            const assignmentMap = {};
            (actionsData || []).forEach(action => {
                if (!assignmentMap[action.incident_id]) {
                    assignmentMap[action.incident_id] = {
                        assigned_to: action.assigned_to,
                        action_id: action.id,
                        due_date: action.due_date
                    };
                }
            });

            // Process incidents to add user names and assignments
            const processedIncidents = incidentsData.map(incident => ({
                ...incident,
                reported_by_name: incident.reported_by ? userMap[incident.reported_by] || 'Unknown' : 'N/A',
                assigned_to: assignmentMap[incident.id]?.assigned_to || null,
                assigned_to_name: assignmentMap[incident.id]?.assigned_to ?
                    userMap[assignmentMap[incident.id].assigned_to] || 'Unknown' : null,
                action_id: assignmentMap[incident.id]?.action_id || null,
                due_date: assignmentMap[incident.id]?.due_date || null
            }));

            console.log('✅ Processed incidents:', processedIncidents.length);
            setIncidents(processedIncidents);
        } catch (error) {
            console.error('❌ Error fetching incidents:', error);
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="dashboard"><p>Loading...</p></div>;
    }

    // Filter incidents based on selected date
    const filteredIncidents = selectedDate
        ? incidents.filter(incident => {
            const incidentDate = new Date(incident.created_at);
            const match = incidentDate.getDate() === selectedDate.getDate() &&
                incidentDate.getMonth() === selectedDate.getMonth() &&
                incidentDate.getFullYear() === selectedDate.getFullYear();

            if (match) console.log('🎯 Match found:', incident.id, incidentDate.toDateString());
            return match;
        })
        : incidents;



    // Calculate KPIs
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const avgResponseTime = '2.4 hrs'; // Simulated

    const kpis = [
        {
            title: 'Total Incidents',
            value: totalIncidents,
            change: '+12%',
            trend: 'up',
            icon: '📊',
            color: 'primary'
        },
        {
            title: 'Open Cases',
            value: openIncidents,
            change: '-8%',
            trend: 'down',
            icon: '⚠️',
            color: 'warning'
        },
        {
            title: 'Critical Issues',
            value: criticalIncidents,
            change: '+3',
            trend: 'up',
            icon: '🚨',
            color: 'danger'
        },
        {
            title: 'Avg Response Time',
            value: avgResponseTime,
            change: '-15%',
            trend: 'down',
            icon: '⏱️',
            color: 'success'
        }
    ];

    // Calculate severity breakdown
    const severityCounts = {
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length
    };
    const maxSeverityCount = Math.max(...Object.values(severityCounts), 1);

    // Calculate monthly trends for last 6 months
    const monthCounts = Array(6).fill(0);
    const now = new Date();

    incidents.forEach(incident => {
        const incidentDate = new Date(incident.created_at);
        const monthsDiff = (now.getFullYear() - incidentDate.getFullYear()) * 12 +
            (now.getMonth() - incidentDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
            monthCounts[5 - monthsDiff]++;
        }
    });

    const maxMonthCount = Math.max(...monthCounts, 1);

    return (
        <div className="dashboard fade-in">
            {/* ... (Header remains the same) */}
            <div className="dashboard-header">
                <div>
                    <h1>Safety Dashboard</h1>
                    <p className="text-muted">Real-time HSE & Quality monitoring</p>
                </div>
                <Link to="/report" className="btn btn-primary">
                    <span>⚠️</span>
                    Report Incident
                </Link>
            </div>

            <div className="dashboard-top-grid">
                <div className="kpi-section">
                    {kpis.map((kpi, index) => (
                        <KPICard key={index} {...kpi} />
                    ))}
                </div>
                <div className="calendar-section">
                    <SafetyCalendar
                        incidents={incidents}
                        onDateSelect={setSelectedDate}
                        selectedDate={selectedDate}
                    />
                </div>
            </div>

            <div className="dashboard-content grid grid-2 mt-xl">
                {/* ... (Charts remain the same) */}
                <div className="card">
                    <h3>Incident Trends</h3>
                    <div className="chart-placeholder">
                        {monthCounts.map((count, index) => (
                            <div
                                key={index}
                                className="chart-bar"
                                style={{ height: `${(count / maxMonthCount) * 100}%` }}
                                title={`${count} incidents`}
                            ></div>
                        ))}
                    </div>
                    <p className="text-muted text-center mt-md">Last 6 months</p>
                </div>

                <div className="card">
                    <h3>Severity Breakdown</h3>
                    <div className="severity-chart">
                        {/* ... (Severity chart content remains the same) */}
                        <div className="severity-item">
                            <div className="severity-bar critical" style={{ width: `${(severityCounts.critical / maxSeverityCount) * 100}%` }}></div>
                            <span className="severity-label">Critical: {severityCounts.critical}</span>
                        </div>
                        <div className="severity-item">
                            <div className="severity-bar high" style={{ width: `${(severityCounts.high / maxSeverityCount) * 100}%` }}></div>
                            <span className="severity-label">High: {severityCounts.high}</span>
                        </div>
                        <div className="severity-item">
                            <div className="severity-bar medium" style={{ width: `${(severityCounts.medium / maxSeverityCount) * 100}%` }}></div>
                            <span className="severity-label">Medium: {severityCounts.medium}</span>
                        </div>
                        <div className="severity-item">
                            <div className="severity-bar low" style={{ width: `${(severityCounts.low / maxSeverityCount) * 100}%` }}></div>
                            <span className="severity-label">Low: {severityCounts.low}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-xl">
                <div className="flex justify-between items-center mb-md">
                    <h3>
                        {selectedDate
                            ? `Incidents for ${selectedDate.toLocaleDateString()}`
                            : 'Recent Incidents'}
                    </h3>
                    {selectedDate && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedDate(null)}
                        >
                            Clear Filter ✕
                        </button>
                    )}
                </div>
                <RecentIncidents incidents={filteredIncidents} onRefresh={fetchIncidents} />
            </div>
        </div>
    );
}
