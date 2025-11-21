import React from 'react'
import '../styles/MisReservas.css'
import { useNavigate } from 'react-router-dom'
import { useObtenerReservasUsuario, useTodosLosTurnos } from '../context/Fetch';
import { useAuth } from '../context/AuthContext';

const MisReservas = () => {
    const navigate = useNavigate();
    const { data, loading } = useObtenerReservasUsuario()
    const { data: todosLosTurnos } = useTodosLosTurnos()
    const { logout } = useAuth();

    function formatHour(hora) {
        const [h, m] = hora.split(":");
        return `${h.padStart(2, "0")}:${m}`;
    }

    const colores = ['lavender', 'mint', 'orange', 'sky', 'rose', 'yellow'];

    return (
        <div className="misreservas-page">
            <header className="mr-header">

                <button className="pill-btn back" onClick={() => { navigate(-1) }}>VOLVER</button>
                <div className="header-center">
                    <h1 className="page-title">MIS RESERVAS</h1>
                </div>
                <button className="pill-btn profile" onClick={logout}>Cerrar Sesión</button>
            </header>

            <main className="reservas-main">
                <div className="reservas-grid">
                    {!loading && todosLosTurnos?.turnos &&
                        data?.reservas?.map((reserva, index) => {
                            const colorClass = colores[index % colores.length];
                            return (
                                <article key={reserva.id_reserva} className={`res-card ${colorClass}`}>
                                    <h2 className='res-title'>{reserva.nombre_sala}</h2>
                                    <div className="divider" />
                                    <ul className="res-details">
                                        <li>Edificio: {reserva.edificio}</li>
                                        <li>Fecha: {reserva.fecha}</li>
                                        <li>
                                            Horario: {
                                                (() => {
                                                    const turno = todosLosTurnos?.turnos?.find(t => t.id_turno === reserva.id_turno);
                                                    return turno ? `${formatHour(turno.hora_inicio)} - ${formatHour(turno.hora_fin)}` : "No disponible";
                                                })()
                                            }
                                        </li>
                                        <li>N° de Participantes: {reserva.participantes}</li>
                                    </ul>
                                </article>
                            )
                        })
                    }
                </div>
            </main>
        </div>
    )
}

export default MisReservas