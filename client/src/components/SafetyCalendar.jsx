import React from 'react';
import './SafetyCalendar.css';

export default function SafetyCalendar({ incidents, onDateSelect, selectedDate }) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Helper to get day status
    const getDayStatus = (day) => {
        const dateStr = new Date(currentYear, currentMonth, day).toDateString();

        // Find incidents for this day
        const dayIncidents = incidents.filter(incident => {
            const incidentDate = new Date(incident.created_at);
            return incidentDate.toDateString() === dateStr;
        });

        if (dayIncidents.length === 0) return 'none';

        // Check for critical incidents
        const hasCritical = dayIncidents.some(i => i.severity === 'critical');
        if (hasCritical) return 'critical';

        return 'incident';
    };

    const handleDayClick = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        if (onDateSelect) {
            // If clicking the same date, deselect it (pass null)
            if (selectedDate && selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear) {
                onDateSelect(null);
            } else {
                onDateSelect(date);
            }
        }
    };

    const renderDays = () => {
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const status = getDayStatus(i);
            const isToday = i === today.getDate();
            const isSelected = selectedDate &&
                selectedDate.getDate() === i &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

            days.push(
                <div
                    key={i}
                    className={`calendar-day status-${status} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDayClick(i)}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="day-number">{i}</span>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="safety-calendar-card">
            <div className="calendar-header">
                <h3>Mois : {capitalizedMonth} {currentYear}</h3>
            </div>

            <div className="calendar-grid">
                {renderDays()}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color status-critical"></div>
                    <span>Incident critique</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color status-incident"></div>
                    <span>Incident non critique</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color status-none"></div>
                    <span>Aucun incident</span>
                </div>
            </div>
        </div>
    );
}
