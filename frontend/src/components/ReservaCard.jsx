const ReservaCard = ({ reserva, colorClass, turno, formatHour }) => {
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

        </article>
    );
};

export default ReservaCard;
