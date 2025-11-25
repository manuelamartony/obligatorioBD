"use client";
import React, { useEffect, useState } from "react";
import "../styles/TurnosPopup.css";
import ConfirmarReserva from "./ConfirmarReserva";
import { useTodosLosTurnos } from "../context/Fetch";
import { useObtenerUsuario } from "../context/Fetch";
import ReservaExitosaPopup from "./ReservaExitosa";

export function formatHour(hora) {
    if (typeof hora === "string") {
        const [h, m] = hora.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    } else if (typeof hora === "number") {
        const h = Math.floor(hora / 3600).toString().padStart(2, "0");
        const m = Math.floor((hora % 3600) / 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    } else return "--:--";
}

const TurnosPopup = ({ sala, onClose, refetchReservas }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [pantalla, setPantalla] = useState("turnos");
    const [mostrarExito, setMostrarExito] = useState(false);
    const [turnoElegido, setTurnoElegido] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);

    const { data: userData } = useObtenerUsuario();
    const { data: todosTurnos } = useTodosLosTurnos();

    const [triggerRefetch, setTriggerRefetch] = useState(0);

    // Interceptamos refetchReservas para actualizar turnos
    useEffect(() => {
        if (!refetchReservas) return;

        const original = refetchReservas;
        refetchReservas.__wrapped__ = true;

        refetchReservas = async (...args) => {
            await original(...args);
            setTriggerRefetch(prev => prev + 1);
        };
    }, []);

    // Inicializamos todos los turnos como disponibles
    useEffect(() => {
        if (!todosTurnos) return;
        setTurnos(
            todosTurnos.turnos.map(t => ({
                ...t,
                disponible: true,
                estado: null
            }))
        );
    }, [todosTurnos]);

    // Refrescar turnos al triggerRefetch
    useEffect(() => {
        if (selectedDate) actualizarTurnos(selectedDate);
    }, [triggerRefetch]);

    const actualizarTurnos = async fecha => {
        if (!fecha || !sala) return;

        try {
            const params = new URLSearchParams({
                fecha,
                sala: sala.nombre_sala,
                edificio: sala.edificio
            });
            const res = await fetch(`http://localhost:3000/api/turnos/ocupados?${params.toString()}`);
            if (!res.ok) return;

            const data = await res.json();
            if (data.success) {
                // Solo bloqueamos turnos cuya reserva esté activa o finalizada
                setTurnos(prev =>
                    prev.map(t => {
                        const ocupado = data.turnos_ocupados.find(
                            o =>
                                o.id_turno === t.id_turno &&
                                ["activa", "finalizada"].includes(o.estado?.toLowerCase())
                        );
                        return ocupado
                            ? { ...t, disponible: false, estado: ocupado.estado }
                            : { ...t, disponible: true, estado: null };
                    })
                );
            }
        } catch (err) {
            console.error("Error actualizando turnos:", err);
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
                <p className="text-error">
                    No podés reservar esta sala porque es de tipo{" "}
                    <strong>{sala.tipo_sala}</strong> y tu tipo de carrera es{" "}
                    <strong>{userData.participante[0].tipo_carrera}</strong>.
                </p>
                <button className="cerrar-btn" onClick={onClose}>Cerrar</button>
            </div>
        );
    }

    return (
        <div className="turnos-popup">
            {mostrarExito && (
                <ReservaExitosaPopup
                    onClose={() => {
                        setMostrarExito(false);
                        onClose();
                    }}
                />
            )}

            {pantalla === "turnos" && (
                <>
                    <h2>{`${sala.nombre_sala} - Elegí fecha y horario`}</h2>

                    <input
                        type="date"
                        className="date-picker"
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDate || ""}
                        onChange={async e => {
                            const value = e.target.value;
                            if (!value) {
                                setSelectedDate(null);
                                setErrorMsg(null);
                                return;
                            }

                            const d = new Date(value + "T00:00:00");
                            const day = d.getDay();
                            if (day === 0 || day === 6) {
                                setSelectedDate(null);
                                setErrorMsg("No se pueden hacer reservas los sábados y domingos.");
                                return;
                            }

                            setSelectedDate(value);
                            setErrorMsg(null);
                            await actualizarTurnos(value);
                        }}
                    />

                    {errorMsg && <div className="text-error">{errorMsg}</div>}

                    {selectedDate && (
                        <>
                            <h3>Disponibilidad del día</h3>
                            <div className="hours-list">
                                {turnos.map(t => (
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
                                            <span>{t.estado === "activa" ? "Ocupado" : t.estado}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <button className="cerrar-btn" onClick={onClose}>Cerrar</button>
                </>
            )}

            {pantalla === "confirmar" && turnoElegido && (
                <ConfirmarReserva
                    turno={turnoElegido}
                    sala={sala}
                    fecha={selectedDate}
                    onBack={() => setPantalla("turnos")}
                    onConfirm={() => setMostrarExito(true)}
                    formatHour={formatHour}
                />
            )}
        </div>
    );
};

export default TurnosPopup;
