import React, { useState } from "react";

import "../styles/ConfirmarReserva.css";
import { useAuth } from "../context/AuthContext";

const ConfirmarReserva = ({
  turno,
  sala,
  fecha,
  onBack,
  onConfirm,
  formatHour,
}) => {
  const [participantes, setParticipantes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { user } = useAuth();
  const newCi = String(user.ci);

  function actualizarCedula(index, valor) {
    const nuevo = [...participantes];
    nuevo[index].ci = valor;
    nuevo[index].estado = "pendiente";
    setParticipantes(nuevo);
  }

  function agregarParticipante() {
    setParticipantes([...participantes, { ci: "", estado: "pendiente" }]);
  }

  function eliminarParticipante(index) {
    const nuevo = participantes.filter((_, i) => i !== index);
    setParticipantes(nuevo);
  }

  async function validarCI(index) {
    const cedula = participantes[index].ci.trim();
    if (!cedula) return;

    // Validar que no sea la cédula del usuario actual
    if (cedula === newCi) {
      const nuevo = [...participantes];
      nuevo[index].estado = "invalido";
      nuevo[index].errorMsg = "No puedes agregarte a ti mismo como participante";
      setParticipantes(nuevo);
      return;
    }

    const nuevo = [...participantes];
    nuevo[index].estado = "validando";
    nuevo[index].errorMsg = "";
    setParticipantes(nuevo);

    try {
      const res = await fetch(`http://localhost:3000/api/auth/me?ci=${cedula}`);
      if (res.ok) {
        nuevo[index].estado = "valido";
        nuevo[index].errorMsg = "";
      } else {
        nuevo[index].estado = "invalido";
        nuevo[index].errorMsg = "Cédula no encontrada";
      }
    } catch {
      nuevo[index].estado = "invalido";
      nuevo[index].errorMsg = "Error al validar";
    }

    setParticipantes([...nuevo]);
  }

  async function subirReserva() {
    setErrorMessage(""); // aca limpio error previo

    const payload = {
      nombre_sala: sala.nombre_sala,
      edificio: sala.edificio,
      fecha: fecha,
      id_turno: turno.id_turno,
      ci: newCi,
      participantes: participantes.map((p) => p.ci.trim()),
    };

    try {
      const res = await fetch("http://localhost:3000/api/reservas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Error desconocido";

        try {
          const data = await res.json();
          msg = data.detail || JSON.stringify(data);
        } catch {
          msg = await res.text();
        }

        setErrorMessage(msg);
        console.error("Error al crear reserva:", res.status, msg);
        return;
      }

      const data = await res.json();

      if (typeof onConfirm === "function") onConfirm(data);
    } catch (e) {
      console.error("Error al conectar con el backend:", e);
      setErrorMessage("No se pudo conectar con el servidor.");
    }
  }

  const formularioValido =
    participantes.length === 0 ||
    participantes.every((p) => p.ci.trim() !== "" && p.estado === "valido");

  return (
    <div className="confirmar-reserva">
      <button className="back-btn" onClick={onBack}>
        ← Volver
      </button>

      <h2>Confirmar reserva</h2>
      <p>
        <strong>Sala:</strong> {sala.nombre_sala}
      </p>
      <p>
        <strong>Fecha:</strong> {fecha}
      </p>
      <p>
        <strong>Horario:</strong> {formatHour(turno.hora_inicio)} -{" "}
        {formatHour(turno.hora_fin)}
      </p>

      <h3>Participantes</h3>

      {participantes.length === 0 && (
        <p style={{ color: "#666", fontSize: "14px" }}>
          No hay participantes agregados.
        </p>
      )}

      <div className="lista-participantes">
        {participantes.map((p, index) => (
          <div className="participante-row" key={index}>
            <input
              type="text"
              min="1"
              placeholder="Cédula"
              value={p.ci}
              onChange={(e) => actualizarCedula(index, e.target.value)}
              className="ci-input"
            />

            <button className="validar-btn" onClick={() => validarCI(index)}>
              Validar
            </button>

            {p.estado === "validando" && (
              <span className="estado estado-validando">⏳</span>
            )}
            {p.estado === "valido" && (
              <span className="estado estado-valido">✔</span>
            )}
            {p.estado === "invalido" && (
              <span className="estado estado-invalido">✖</span>
            )}

            <button
              className="remove-btn"
              onClick={() => eliminarParticipante(index)}
            >
              ✕
            </button>

            {p.errorMsg && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "5px", width: "100%" }}>
                {p.errorMsg}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="agregar-btn" onClick={agregarParticipante}>
        + Agregar participante
      </button>

      <button
        className={`confirm-btn ${!formularioValido ? "disabled" : ""}`}
        disabled={!formularioValido}
        onClick={subirReserva}
      >
        Confirmar reserva
      </button>

      {errorMessage && (
        <p className="error-text" style={{ marginTop: "15px", color: "red" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default ConfirmarReserva;
