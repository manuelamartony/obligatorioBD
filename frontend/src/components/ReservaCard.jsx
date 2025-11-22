const ReservaCard = ({ reserva, colorClass, turno, formatHour, fetchData }) => {

    const cancelarReserva = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/reservas/${reserva.id_reserva}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ estado: "cancelada" }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchData();
            } else {
                alert("Error al cancelar la reserva");
            }
        } catch (error) {
            console.error("Error al cancelar la reserva:", error);
            alert("Ocurrió un error, intenta nuevamente.");
        }
    };

    const estadoClass =
        reserva.estado === "cancelada"
            ? "cancelada"
            : reserva.estado === "sin asistencia"
                ? "sin-asistencia"
                : "";

    return (
        <article className={`res-card ${colorClass} ${estadoClass}`}>
            <h2 className="res-title">{reserva.nombre_sala}</h2>
            <div className="divider" />

            <ul className="res-details">
                <li><strong>Edificio:</strong> {reserva.edificio}</li>
                <li><strong>Fecha:</strong> {reserva.fecha}</li>
                <li>
                    <strong>Horario:</strong>
                    {turno
                        ? ` ${formatHour(turno.hora_inicio)} - ${formatHour(turno.hora_fin)}`
                        : " No disponible"
                    }
                </li>
                <li><strong>N° de Participantes:</strong> {reserva.participantes}</li>
            </ul>

            {estadoClass === "" && (
                <button className="cancel-btn" onClick={cancelarReserva}>
                    Cancelar reserva
                </button>
            )}
        </article>
    );
};

export default ReservaCard;
