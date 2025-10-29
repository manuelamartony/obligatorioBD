import React from 'react'
import '../styles/Reportes.css'
import { useNavigate } from 'react-router-dom'


const reports = [
    { id: 1, title: 'SALAS MAS RESERVADAS', color: 'lavender' },
    { id: 2, title: 'TURNOS MAS DEMANDADOS', color: 'mint' },
    { id: 3, title: 'PROMEDIO DE PARTICIPANTES POR SALA', color: 'mint' },
    { id: 4, title: 'RESERVAS POR CARRERA/FACULTAD', color: 'orange' },
    { id: 5, title: 'OCUPACIÓN SALAS X EDIFICIO', color: 'orange' },
    { id: 6, title: 'CANT. RESERVAS', color: 'lavender' }
]

const Reportes = () => {
    const navigate = useNavigate();
    return (
        <div className="reportes-page">
            <header className="rp-header">
                <button className="pill-btn back" onClick={() => { navigate(-1) }}>VOLVER</button>
                <h1 className="rp-title">REPORTES</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <div className="search-wrap">
                <input className="search-input" placeholder="BUSCAR REPORTE" aria-label="Buscar reporte" />
            </div>

            <main className="reports-grid">
                {reports.map((r) => (
                    <button key={r.id} className={`report-btn ${r.color}`}>
                        {r.title}
                    </button>
                ))}
            </main>
        </div>
    )
}

export default Reportes