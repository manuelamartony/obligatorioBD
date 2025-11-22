import '../styles/MisReservas.css'
import { useNavigate } from 'react-router-dom'
import { useObtenerReservasUsuario, useTodosLosTurnos } from '../context/Fetch';
import { useAuth } from '../context/AuthContext';
import ReservaCard from '../components/ReservaCard';

const MisReservas = () => {
    const navigate = useNavigate();
    const { data, isLoading, fetchData } = useObtenerReservasUsuario();
    const { data: todosLosTurnos } = useTodosLosTurnos();
    const { logout } = useAuth();

    function formatHour(hora) {
        const [h, m] = hora.split(":");
        return `${h.padStart(2, "0")}:${m}`;
    }

    const colores = ['lavender', 'mint', 'orange', 'sky', 'rose', 'yellow'];

    if (isLoading) return <p>Cargando...</p>;
    if (!data?.reservas) return <p>No tienes reservas.</p>;

    const reservas = data.reservas;

    // Agrupación simple por estado
    const activas = reservas.filter(r => r.estado === "activa");
    const canceladas = reservas.filter(r => r.estado === "cancelada");
    const sinAsistencia = reservas.filter(r => r.estado === "sin asistencia");

    const renderSeccion = (titulo, lista) => (
        <section className="reservas-section">
            <h2 className="section-title">{titulo}:</h2>

            {lista.length === 0 ? (
                <p className="empty-message">No hay reservas</p>
            ) : (
                <div className="reservas-grid">
                    {lista.map((reserva, index) => {
                        const colorClass = colores[index % colores.length];
                        const turno = todosLosTurnos?.turnos?.find(
                            t => t.id_turno === reserva.id_turno
                        );

                        return (
                            <ReservaCard
                                key={reserva.id_reserva}
                                reserva={reserva}
                                turno={turno}
                                colorClass={colorClass}
                                formatHour={formatHour}
                                fetchData={fetchData}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );

    return (
        <div className="misreservas-page">
            <header className="mr-header">
                <button className="pill-btn back" onClick={() => navigate(-1)}>VOLVER</button>

                <div className="header-center">
                    <h1 className="page-title">MIS RESERVAS</h1>
                </div>

                <button className="pill-btn profile" onClick={logout}>Cerrar Sesión</button>
            </header>

            <main className="reservas-main">
                {renderSeccion("Reservas Activas", activas)}
                {renderSeccion("Reservas Canceladas", canceladas)}
                {renderSeccion("Reservas sin Asistencia", sinAsistencia)}
            </main>
        </div>
    );
};

export default MisReservas;
