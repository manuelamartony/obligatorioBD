import React, { useEffect, useState } from 'react';
import '../styles/TurnosPopup.css';
export async function getReservas() {
    const resReservas = await fetch("http://localhost:3001/schedule_sala");
    return await resReservas.json();
}

const TurnosPopup = ({ sala }) => {
    const hours = [
        '8:00',
        '9:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
    ];
    const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

    const [reservas, setReservas] = useState([])

    useEffect(() => {
        async function fetchReservas() {
            const data = await getReservas();
            setReservas(data);
        }
        fetchReservas();
    }, []);

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
                                    <td
                                        key={`${day}-${hour}`}
                                        className={`status-cell ${reservas?.[sala.nombre_sala]?.[day]?.[hour] === "OCUPADO"
                                                ? "ocupado"
                                                : "disponible"
                                            }`}
                                    >
                                        {reservas?.[sala.nombre_sala]?.[day]?.[hour] === "OCUPADO"
                                            ? "OCUPADO"
                                            : "DISPONIBLE"}
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