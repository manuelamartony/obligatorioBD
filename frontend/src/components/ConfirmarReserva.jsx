import React, { useState } from "react";

import "../styles/ConfirmarReserva.css";

const ConfirmarReserva = ({
  turno,
  sala,
  fecha,
  onBack,
  onConfirm,
  formatHour,
}) => {
  const [participantes, setParticipantes] = useState([]);

  function actualizarCedula(index, valor) {
    const nuevo = [...participantes];
    nuevo[index].ci = valor;
    nuevo[index].estado = "pendiente"; // cada vez que se cambia la CI, estado vuelve a pendiente
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

    const nuevo = [...participantes];
    nuevo[index].estado = "validando";
    setParticipantes(nuevo);

    try {
      const res = await fetch(`http://localhost:3000/api/auth/me?ci=${cedula}`);
      if (res.ok) {
        nuevo[index].estado = "valido";
      } else {
        nuevo[index].estado = "invalido";
      }
    } catch {
      nuevo[index].estado = "invalido";
    }

    setParticipantes([...nuevo]);
  }
  async function subirReserva() {
    console.log(participantes);
    console.log(participantes.map((p) => p.ci.trim()));

    const payload = {
      nombre_sala: sala.nombre_sala,
      edificio: sala.edificio,
      fecha: fecha,
      id_turno: turno.id_turno,
      ci: localStorage.getItem("ci") || "55555555",
      participantes: participantes.map((p) => p.ci.trim()),
    };

    try {
      const res = await fetch("http://localhost:3000/api/reservas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error al crear reserva:", res.status, text);
        return;
      }

      const data = await res.json();
      // llamar callback si el componente padre lo pidió
      if (typeof onConfirm === "function") onConfirm(data);
    } catch (e) {
      console.error("Error al conectar con el backend:", e);
    }
  }

  // Todos los participantes deben tener CI y estar validados
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
          </div>
        ))}
      </div>

      <button className="agregar-btn" onClick={agregarParticipante}>
        + Agregar participante
      </button>

      <button
        className={`confirm-btn ${!formularioValido ? "disabled" : ""}`}
        disabled={!formularioValido}
        onClick={() => {
          subirReserva();
        }}
      >
        Confirmar reserva
      </button>
    </div>
  );
};

export default ConfirmarReserva;
