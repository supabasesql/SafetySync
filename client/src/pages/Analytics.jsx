import { useState, useEffect } from 'react';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
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

    if (loading) {
        return <div className="analytics"><p>Loading...</p></div>;
    }

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

    // Calculate category distribution
    const categoryCounts = {
        safety: incidents.filter(i => i.category === 'safety').length,
        quality: incidents.filter(i => i.category === 'quality').length,
        environmental: incidents.filter(i => i.category === 'environmental').length,
        equipment: incidents.filter(i => i.category === 'equipment').length
    };
    const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

    // Calculate top risk areas by location
    const locationCounts = {};
    incidents.forEach(incident => {
        locationCounts[incident.location] = (locationCounts[incident.location] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <div className="analytics fade-in">
            <div className="analytics-header">
                <div>
                    <h1>Analytics & Insights</h1>
                    <p className="text-muted">Data-driven safety and quality metrics</p>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h3>Incident Trends</h3>
                    <p className="text-muted mb-lg">Monthly incident count over the last 6 months</p>
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
                </div>

                <div className="card">
                    <h3>Category Distribution</h3>
                    <p className="text-muted mb-lg">Incidents by category</p>
                    <div className="category-chart">
                        <div className="category-item">
                            <div className="category-bar" style={{ width: `${(categoryCounts.safety / maxCategoryCount) * 100}%`, background: 'var(--danger)' }}></div>
                            <span>Safety: {categoryCounts.safety}</span>
                        </div>
                        <div className="category-item">
                            <div className="category-bar" style={{ width: `${(categoryCounts.quality / maxCategoryCount) * 100}%`, background: 'var(--warning)' }}></div>
                            <span>Quality: {categoryCounts.quality}</span>
                        </div>
                        <div className="category-item">
                            <div className="category-bar" style={{ width: `${(categoryCounts.environmental / maxCategoryCount) * 100}%`, background: 'var(--info)' }}></div>
                            <span>Environmental: {categoryCounts.environmental}</span>
                        </div>
                        <div className="category-item">
                            <div className="category-bar" style={{ width: `${(categoryCounts.equipment / maxCategoryCount) * 100}%`, background: 'var(--success)' }}></div>
                            <span>Equipment: {categoryCounts.equipment}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Top Risk Areas</h3>
                    <p className="text-muted mb-lg">Locations with highest incident rates</p>
                    <div className="risk-list">
                        {topLocations.length > 0 ? (
                            topLocations.map(([location, count], index) => (
                                <div key={index} className="risk-item">
                                    <span className="risk-rank">{index + 1}</span>
                                    <span className="risk-location">{location}</span>
                                    <span className={`badge ${count >= 10 ? 'badge-danger' : count >= 5 ? 'badge-warning' : 'badge-info'}`}>
                                        {count} incident{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-center">No incidents recorded yet</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3>Response Time Analysis</h3>
                    <p className="text-muted mb-lg">Average time to resolution by severity</p>
                    <div className="response-chart">
                        <div className="response-item">
                            <span className="response-label">Critical</span>
                            <div className="response-bar" style={{ width: '20%', background: 'var(--success)' }}></div>
                            <span className="response-time">1.2 hrs</span>
                        </div>
                        <div className="response-item">
                            <span className="response-label">High</span>
                            <div className="response-bar" style={{ width: '35%', background: 'var(--info)' }}></div>
                            <span className="response-time">2.8 hrs</span>
                        </div>
                        <div className="response-item">
                            <span className="response-label">Medium</span>
                            <div className="response-bar" style={{ width: '60%', background: 'var(--warning)' }}></div>
                            <span className="response-time">6.5 hrs</span>
                        </div>
                        <div className="response-item">
                            <span className="response-label">Low</span>
                            <div className="response-bar" style={{ width: '80%', background: 'var(--danger)' }}></div>
                            <span className="response-time">12.3 hrs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
