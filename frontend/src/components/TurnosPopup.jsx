"use client";
import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";
import ConfirmarReserva from "./ConfirmarReserva";
import { useObtenerTurnosDelDia, useTodosLosTurnos } from "../context/Fetch";
import { useObtenerUsuario } from "../context/Fetch";



function formatHour(hora) {
    const [h, m] = hora.split(":");
    return `${h.padStart(2, "0")}:${m}`;
}

const TurnosPopup = ({ sala }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [pantalla, setPantalla] = useState("turnos"); // "turnos" | "confirmar"
    const [turnoElegido, setTurnoElegido] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const { data: userData, loading } = useObtenerUsuario();
    const { data: todosTurnos } = useTodosLosTurnos();
    const { data: turnosDisponibles } = useObtenerTurnosDelDia(selectedDate, sala);

    function puedeReservar() {
        if (!userData?.participante || !sala?.tipo_sala) return false;

        const usuario = userData.participante[0];
        const tipoCarrera = usuario.tipo_carrera;
        const rol = usuario.rol;
        const tipoSala = sala.tipo_sala;

        // Salas libres -> todos pueden reservar
        if (tipoSala === "libre") return true;

        // Salas de grado
        if (tipoSala === "grado" && tipoCarrera === "grado") return true;

        // Salas de postgrado
        if (tipoSala === "postgrado" && tipoCarrera === "postgrado") return true;

        // Salas docentes
        if (tipoSala === "docente" && rol === "docente") return true;

        // Si no coincide, no puede reservar
        return false;
    }


    useEffect(() => {
        if (!selectedDate || !todosTurnos?.turnos || !turnosDisponibles?.turnos_disponibles) return;

        const disponiblesIds = turnosDisponibles.turnos_disponibles.map((t) => t.id_turno);

        const turnosFormateados = todosTurnos.turnos.map((t) => ({
            ...t,
            ini: formatHour(t.hora_inicio),
            fin: formatHour(t.hora_fin),
            disponible: disponiblesIds.includes(t.id_turno),
        }));

        setTurnos(turnosFormateados);
    }, [selectedDate, todosTurnos, turnosDisponibles]);

    function reservarTurno(turno) {
        setTurnoElegido(turno);
        setPantalla("confirmar");
    }

    function confirmarReserva(payload) {
        fetch("http://localhost:3000/api/reservas/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then(console.log)
            .catch(console.error);
    }

    if (userData && !puedeReservar()) {
        return (
            <div className="turnos-popup">
                <h2>{sala.nombre_sala}</h2>
                <p className="text-error" style={{ fontSize: "1.2rem", padding: "1rem" }}>
                    No podés reservar esta sala porque es de tipo <strong>{sala.tipo_sala}</strong> y
                    tu tipo de carrera es <strong>{userData.participante[0].tipo_carrera}</strong>.
                </p>
            </div>
        );
    }

    return (
        <div className="turnos-popup">
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
                            if (!value) return setSelectedDate(null);

                            const d = new Date(value + "T00:00:00");
                            const day = d.getDay();
                            if (day === 0 || day === 6) {
                                const daysToAdd = day === 6 ? 2 : 1;
                                d.setDate(d.getDate() + daysToAdd);
                                setSelectedDate(d.toISOString().split("T")[0]);
                                setErrorMsg("Sábados y Domingos no disponibles para reservas.");
                            } else {
                                setSelectedDate(value);
                                setErrorMsg(null);
                            }
                            setPantalla("turnos");
                        }}
                    />
                    {errorMsg && <div className="text-error">{errorMsg}</div>}
                    {selectedDate && (
                        <>
                            <p className="text-error">
                                IMPORTANTE: Las salas solo pueden reservarse por horas completas y por un máximo de 2 horas por día.
                            </p>
                            <h3>Disponibilidad del día</h3>
                            <div className="hours-list">
                                {turnos.map((t) => (
                                    <div
                                        key={t.id_turno}
                                        className={`hour-card ${t.disponible ? "disponible" : "ocupado"}`}
                                    >
                                        <span>{t.ini} - {t.fin}</span>
                                        {t.disponible ? (
                                            <button className="reservar-btn" onClick={() => reservarTurno(t)}>
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
