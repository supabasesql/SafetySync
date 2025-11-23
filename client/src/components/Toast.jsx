import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    return (
        <div className={`toast toast-${type} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={() => setIsVisible(false)}>×</button>
        </div>
    );
}
