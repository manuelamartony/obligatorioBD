import React from 'react'
import '../styles/Reportes.css'
import { useNavigate } from 'react-router-dom'
import { useSalasMasReservadas, useTurnosMasDemandados, usePromedioMasParticipantesPorSala, useSancionesSegunCarrera, useCantidadReservasSegunDia } from '../context/FetchReportes'


const Reportes = () => {
    const { data: SalasMasReservadas, loading: salasLoading, error: salasError } = useSalasMasReservadas()
    const { data: TurnosMasDemandados, loading: turnosLoading, error: turnosError } = useTurnosMasDemandados()
    const { data: PromedioMasParticipantesPorSala, loading: promedioLoading, error: promedioError } = usePromedioMasParticipantesPorSala()
    // const { data: SancionesSegunCarrera, loading: sancionesLoading, error: sancionesError } = useSancionesSegunCarrera() //esta dando error
    const { data: CantidadReservasSegunDia, loading: reservasDiaLoading, error: reservasDiaError } = useCantidadReservasSegunDia()


    const navigate = useNavigate();
    return (
        <div className="reportes-page">
            <header className="rp-header">
                <button className="pill-btn back" onClick={() => { navigate(-1) }}>VOLVER</button>
                <h1 className="rp-title">REPORTES</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <main className="reports-grid">

            </main>
        </div>
    )
}

export default Reportes