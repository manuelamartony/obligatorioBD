import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";
import ConfirmarReserva from "./ConfirmarReserva";

async function getDisponibilidad(nombreSala, fecha, edificio) {
    const res = await fetch(
        `http://localhost:3000/api/salas/${encodeURIComponent(nombreSala)}/disponibilidad?fecha=${fecha}&edificio=${encodeURIComponent(edificio)}`
    );

    if (!res.ok) throw new Error("Error obteniendo disponibilidad");

    return await res.json();
}

function formatHour(hora) {
    const partes = hora.split(":");
    return partes[0].padStart(2, "0") + ":" + partes[1];
}

const TurnosPopup = ({ sala }) => {

    const [selectedDate, setSelectedDate] = useState(null);
    const [turnos, setTurnos] = useState([]);

    // NUEVO: control de pantallas internas
    const [pantalla, setPantalla] = useState("turnos"); // "turnos" o "confirmar"
    const [turnoElegido, setTurnoElegido] = useState(null);

    useEffect(() => {
        if (!selectedDate) return;

        async function load() {
            try {
                const data = await getDisponibilidad(
                    sala.nombre_sala,
                    selectedDate,
                    sala.edificio
                );

                const formatted = data.turnos.map(t => ({
                    ...t,
                    ini: formatHour(t.hora_inicio),
                    fin: formatHour(t.hora_fin)
                }));

                setTurnos(formatted);

            } catch (err) {
                console.error(err);
            }
        }

        load();
    }, [selectedDate, sala.nombre_sala]);


    function reservarTurno(turno) {
        setTurnoElegido(turno);
        setPantalla("confirmar");
    }


    function confirmarReserva(payload) {
        console.log("🔵 RESERVA CONFIRMADA:", payload);
        // acá haces el POST al backend si querés
        // fetch("POST /reservas", {...})
    }


    return (
        <div className="turnos-popup">

            {/* ------------------- PANTALLA 1: TURNOS ------------------- */}
            {pantalla === "turnos" && (
                <>
                    <h2>{`${sala.nombre_sala} - Elegí fecha y horario`}</h2>

                    <input
                        type="date"
                        className="date-picker"
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setPantalla("turnos");
                        }}
                    />

                    {selectedDate && (
                        <>
                            <h3>Disponibilidad del día</h3>

                            <div className="hours-list">
                                {turnos.map((t) => (
                                    <div
                                        key={t.id_turno}
                                        className={`hour-card ${t.disponible ? "disponible" : "ocupado"}`}
                                    >
                                        <span>{t.ini} - {t.fin}</span>

                                        {t.disponible ? (
                                            <button
                                                className="reservar-btn"
                                                onClick={() => reservarTurno(t)}
                                            >
                                                Reservar
                                            </button>
                                        ) : (
                                            <span>Ocupado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}


            {/* ------------------- PANTALLA 2: CONFIRMAR ------------------- */}
            {pantalla === "confirmar" && turnoElegido && (
                <ConfirmarReserva
                    turno={turnoElegido}
                    sala={sala.nombre_sala}
                    fecha={selectedDate}
                    onBack={() => setPantalla("turnos")}
                    onConfirm={confirmarReserva}
                />
            )}
        </div>
    );
};

export default TurnosPopup;
