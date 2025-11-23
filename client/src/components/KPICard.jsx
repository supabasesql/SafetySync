import './KPICard.css';

export default function KPICard({ title, value, change, trend, icon, color }) {
    return (
        <div className={`kpi-card card kpi-${color}`}>
            <div className="kpi-header">
                <span className="kpi-icon">{icon}</span>
                <span className={`kpi-trend ${trend}`}>{change}</span>
            </div>
            <div className="kpi-body">
                <div className="kpi-value">{value}</div>
                <div className="kpi-title">{title}</div>
            </div>
        </div>
    );
}
