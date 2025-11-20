import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";
import ConfirmarReserva from "./ConfirmarReserva";

// 1) Obtener todos los turnos del día (solo los disponibles)
async function getTurnosDisponiblesDelDia(fecha, sala, edificio) {
    const res = await fetch(
        `http://localhost:3000/api/turnos/disponibles?fecha=${encodeURIComponent(
            fecha
        )}&sala=${encodeURIComponent(sala)}&edificio=${encodeURIComponent(edificio)}`
    );

    if (!res.ok) throw new Error("Error obteniendo turnos disponibles");
    return await res.json();
}

// 2) Obtener todos los turnos del sistema (para ver los ocupados)
async function getTodosLosTurnos() {
    const res = await fetch("http://localhost:3000/api/turnos/");
    if (!res.ok) throw new Error("Error obteniendo todos los turnos");
    const data = await res.json();
    return data.turnos;
}

// Hora bonita
function formatHour(hora) {
    const [h, m] = hora.split(":");
    return `${h.padStart(2, "0")}:${m}`;
}

const TurnosPopup = ({ sala }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null)

    const [pantalla, setPantalla] = useState("turnos"); // "turnos" | "confirmar"
    const [turnoElegido, setTurnoElegido] = useState(null);

    useEffect(() => {
        if (!selectedDate) return;

        async function load() {
            try {
                // 1️⃣ Todos los turnos del sistema
                const todosTurnos = await getTodosLosTurnos();

                // 2️⃣ Turnos disponibles del día
                const data = await getTurnosDisponiblesDelDia(
                    selectedDate,
                    sala.nombre_sala,
                    sala.edificio
                );
                const disponiblesIds = data.turnos_disponibles.map((t) => t.id_turno);

                // 3️⃣ Formatear todos los turnos y marcar ocupados
                const turnosFormateados = todosTurnos.map((t) => ({
                    ...t,
                    ini: formatHour(t.hora_inicio),
                    fin: formatHour(t.hora_fin),
                    disponible: disponiblesIds.includes(t.id_turno),
                }));

                setTurnos(turnosFormateados);
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
        // fetch POST acá
    }

    return (
        <div className="turnos-popup">
            {/* ------------------- PANTALLA TURNOS ------------------- */}
            {pantalla === "turnos" && (
                <>
                    <h2>{`${sala.nombre_sala} - Elegí fecha y horario`}</h2>

                    <input
                        type="date"
                        className="date-picker"
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDate || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (!value) {
                                setSelectedDate(null);
                                return;
                            }
                            const d = new Date(value + "T00:00:00"); // forzar timezone safe
                            const day = d.getDay(); // 0 domingo, 6 sabado
                            if (day === 0 || day === 6) {
                                // buscar siguiente lunes automático
                                const daysToAdd = day === 6 ? 2 : 1;
                                d.setDate(d.getDate() + daysToAdd);
                                const corrected = d.toISOString().split("T")[0];
                                setSelectedDate(corrected);
                                // opcional: mostrar mensaje inline
                                setErrorMsg("Sábados y Domingos no disponibles para reservas.");
                            } else {
                                setSelectedDate(value);
                                setErrorMsg(null);
                            }
                            setPantalla("turnos");
                        }}
                        onBlur={(e) => {
                            // doble validación por si el usuario pegó un texto inválido
                            const value = e.target.value;
                            if (!value) return;
                            const d = new Date(value + "T00:00:00");
                            if (isNaN(d)) {
                                setSelectedDate(null);
                                setErrorMsg("Fecha inválida");
                            }
                        }}
                    />
                    {errorMsg ? <div className="text-error">{errorMsg}</div> :

                        selectedDate && (
                            <>
                                <p className="text-error">IMPORTANTE: Las salas solo pueden reservarse por horas completas y por un máximo de 2 horas por día.</p>
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

            {/* ------------------- PANTALLA CONFIRMAR ------------------- */}
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
