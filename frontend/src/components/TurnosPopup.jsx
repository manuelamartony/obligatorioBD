import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";

export async function getReservas() {
    const res = await fetch("http://localhost:3001/reserva");
    return await res.json();
}

export async function getTurnos() {
    const res = await fetch("http://localhost:3001/turno");
    return await res.json();
}

const ALL_HOURS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

function getHoursBetween(start, end) {
    let s = parseInt(start.split(":")[0]);
    let e = parseInt(end.split(":")[0]);
    let result = [];
    while (s < e) {
        result.push(s.toString().padStart(2, "0") + ":00");
        s++;
    }
    return result;
}

const TurnosPopup = ({ sala }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [turnos, setTurnos] = useState([]);

    const [inicio, setInicio] = useState("");
    const [fin, setFin] = useState("");

    useEffect(() => {
        async function load() {
            setReservas(await getReservas());
            setTurnos(await getTurnos());
        }
        load();
    }, []);

    // Reservas de ese día y sala
    const reservasDia = reservas.filter(
        r => r.nombre_sala === sala.nombre_sala && r.fecha === selectedDate
    );

    // Horas ocupadas
    let horasOcupadas = [];
    reservasDia.forEach(r => {
        const t = turnos.find(t => t.id_turno === r.id_turno);
        if (t) horasOcupadas.push(...getHoursBetween(t.hora_inicio, t.hora_fin));
    });

    // Validación rango
    const rangoValido =
        inicio &&
        fin &&
        ALL_HOURS.indexOf(fin) <= ALL_HOURS.indexOf(inicio) + 2 &&
        ALL_HOURS.indexOf(fin) > ALL_HOURS.indexOf(inicio) &&
        !ALL_HOURS
            .slice(
                ALL_HOURS.indexOf(inicio),
                ALL_HOURS.indexOf(fin)
            )
            .some(h => horasOcupadas.includes(h));

    function handleReserva() {

    }



    return (
        <div className="turnos-popup">
            <h2>{`${sala.nombre_sala} - Elegí fecha y horario`}</h2>

            <input
                type="date"
                className="date-picker"
                onChange={e => {
                    setSelectedDate(e.target.value);
                    setInicio("");
                    setFin("");
                }}
            />

            {selectedDate && (
                <>
                    <div className="hour-date-container">
                        <div className="selector">
                            <label>Hora de inicio:</label>
                            <select
                                value={inicio}
                                onChange={(e) => {
                                    setInicio(e.target.value);
                                    setFin("");
                                }}
                            >
                                <option value="">Seleccionar…</option>

                                {ALL_HOURS.map(h => (
                                    <option
                                        key={h}
                                        value={h}
                                        disabled={horasOcupadas.includes(h)}
                                    >
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {inicio && (
                            <div className="selector">
                                <label>Hora final:</label>
                                <select
                                    value={fin}
                                    onChange={(e) => setFin(e.target.value)}
                                >
                                    <option value="">Seleccionar…</option>

                                    {ALL_HOURS.map(h => (
                                        <option
                                            key={h}
                                            value={h}
                                            disabled={
                                                horasOcupadas.includes(h) ||
                                                ALL_HOURS.indexOf(h) <= ALL_HOURS.indexOf(inicio) ||
                                                ALL_HOURS.indexOf(h) > ALL_HOURS.indexOf(inicio) + 2
                                            }
                                        >
                                            {h}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        )}

                        <button
                            className={`reservar-btn ${rangoValido ? "" : "disabled"}`}
                            disabled={!rangoValido}
                            onClick={() => handleReserva()}
                        >
                            Reservar
                        </button>
                    </div>

                    <p style={{ color: 'red', fontWeight: 'bold' }}>IMPORTANTE: Las salas solo pueden reservarse por horas completas y por un máximo de 2 horas por día. Tampoco es posible participar de más de 3 reservas activas en una semana</p>

                    <h3>Disponibilidad del día</h3>

                    <div className="hours-list">
                        {ALL_HOURS.map(hour => {
                            const ocupado = horasOcupadas.includes(hour);
                            const dentroRango =
                                inicio &&
                                fin &&
                                ALL_HOURS.indexOf(hour) >= ALL_HOURS.indexOf(inicio) &&
                                ALL_HOURS.indexOf(hour) < ALL_HOURS.indexOf(fin);

                            return (
                                <div
                                    key={hour}
                                    className={
                                        "hour-card " +
                                        (ocupado ? "ocupado" : "disponible") +
                                        (dentroRango ? " seleccionado" : "")
                                    }
                                >
                                    <span>{hour}</span>
                                    <span>{ocupado ? "Ocupado" : "Libre"}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default TurnosPopup;
