"use client";
import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";
import ConfirmarReserva from "./ConfirmarReserva";
import { useTodosLosTurnos } from "../context/Fetch";
import { useObtenerUsuario } from "../context/Fetch";

export function formatHour(hora) {
    if (typeof hora === "string") {
        // formato "HH:MM:SS" -> "HH:MM"
        const [h, m] = hora.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    } else if (typeof hora === "number") {
        // formato segundos -> "HH:MM"
        const h = Math.floor(hora / 3600).toString().padStart(2, "0");
        const m = Math.floor((hora % 3600) / 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    } else {
        return "--:--";
    }
}


const TurnosPopup = ({ sala }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [pantalla, setPantalla] = useState("turnos"); // "turnos" | "confirmar"
    const [turnoElegido, setTurnoElegido] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const { data: userData, loading } = useObtenerUsuario();
    const { data: todosTurnos } = useTodosLosTurnos();

    // Cargar todos los turnos como base
    useEffect(() => {
        if (todosTurnos) {
            const turnosDisponibles = todosTurnos.turnos.map(t => ({
                ...t,
                disponible: true
            }));
            setTurnos(turnosDisponibles);
        }
    }, [todosTurnos]);

    // Función para actualizar turnos ocupados
    const actualizarTurnos = async (fecha) => {
        if (!fecha || !sala) return;

        try {
            const params = new URLSearchParams({
                fecha,
                sala: sala.nombre_sala,
                edificio: sala.edificio
            });

            const res = await fetch(`/api/turnos/ocupados?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setTurnos(prevTurnos =>
                    prevTurnos.map(t => {
                        const ocupado = data.turnos_ocupados.find(o => o.id_turno === t.id_turno);
                        return ocupado ? { ...t, disponible: false, estado: ocupado.estado, hora_inicio: ocupado.hora_inicio, hora_fin: ocupado.hora_fin } : { ...t, disponible: true };
                    })
                );
            }
        } catch (error) {
            console.error("Error al obtener turnos ocupados:", error);
        }
    };

    function puedeReservar() {
        if (!userData?.participante || !sala?.tipo_sala) return false;

        const usuario = userData.participante[0];
        const tipoCarrera = usuario.tipo_carrera;
        const rol = usuario.rol;
        const tipoSala = sala.tipo_sala;

        if (tipoSala === "libre") return true;
        if (tipoSala === "grado" && tipoCarrera === "grado") return true;
        if (tipoSala === "postgrado" && tipoCarrera === "postgrado") return true;
        if (tipoSala === "docente" && rol === "docente") return true;
        return false;
    }

    function reservarTurno(turno) {
        setTurnoElegido(turno);
        setPantalla("confirmar");
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
                        onChange={async (e) => {
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

                            // Actualizar turnos ocupados para la fecha seleccionada
                            await actualizarTurnos(value);
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
                                        <span>{formatHour(t.hora_inicio)} - {formatHour(t.hora_fin)}</span>
                                        {t.disponible ? (
                                            <button className="reservar-btn" onClick={() => reservarTurno(t)}>
                                                Reservar
                                            </button>
                                        ) : (
                                            <span>{t.estado || "Ocupado"}</span>
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
                    formatHour={formatHour}
                />
            )}
        </div>
    );
};

export default TurnosPopup;
