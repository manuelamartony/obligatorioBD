import React from 'react';
import '../styles/TurnosPopup.css';

const TurnosPopup = () => {
    const hours = [
        '8:00 A.M.',
        '9:00 A.M.',
        '10:00 A.M.',
        '11:00 A.M.',
        '12:00 P.M',
        '13:00 P.M.',
        '14:00 P.M.',
        '15:00 P.M.',
        '16:00 P.M.',
        '17:00 P.M.',
        '18:00 P.M.',
        '19:00 P.M.',
        '20:00 P.M.',
        '21:00 P.M.',
        '22:00 P.M.',
        '23:00 P.M.',
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Example schedule data - replace with your actual data
    const schedule = {
        'Monday': {
            '8:00 A.M.': 'DISPONIBLE',
            '12:00 NOON': 'DISPONIBLE',
            '1:00 P.M.': 'DISPONIBLE',
            '2:00 P.M.': 'DISPONIBLE'
        },
        'Tuesday': {
            '8:00 A.M.': 'OCUPADO',
            '9:00 A.M.': 'DISPONIBLE',
            '12:00 NOON': 'DISPONIBLE',
            '1:00 P.M.': 'OCUPADO'
        },
        'Wednesday': {
            '12:00 NOON': 'DISPONIBLE',
            '1:00 P.M.': 'OCUPADO',
            '2:00 P.M.': 'OCUPADO',
            '3:00 P.M.': 'OCUPADO'
        },
        'Thursday': {
            '8:00 A.M.': 'DISPONIBLE',
            '12:00 NOON': 'DISPONIBLE',
            '1:00 P.M.': 'OCUPADO',
            '2:00 P.M.': 'OCUPADO',
            '3:00 P.M.': 'OCUPADO'
        },
        'Friday': {
            '8:00 A.M.': 'OCUPADO',
            '9:00 A.M.': 'OCUPADO',
            '10:00 A.M.': 'OCUPADO',
            '11:00 A.M.': 'OCUPADO',
            '12:00 NOON': 'DISPONIBLE'
        }
    };

    return (
        <div className="turnos-popup">
            <h2 className="popup-title">TURNOS DISPONIBLES</h2>
            <div className="schedule-table">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {days.map(day => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour}>
                                <td className="hour-cell">{hour}</td>
                                {days.map(day => (
                                    <td key={`${day}-${hour}`} className={`status-cell ${schedule[day]?.[hour]?.toLowerCase() || ''}`}>
                                        {schedule[day]?.[hour] || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TurnosPopup;