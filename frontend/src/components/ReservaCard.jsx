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
                <li>Edificio: {reserva.edificio}</li>
                <li>Fecha: {reserva.fecha}</li>

                <li>
                    Horario:
                    {turno
                        ? ` ${formatHour(turno.hora_inicio)} - ${formatHour(turno.hora_fin)}`
                        : " No disponible"
                    }
                </li>

                <li>N° de Participantes: {reserva.participantes}</li>
            </ul>

        </article>
    );
};

export default ReservaCard;
