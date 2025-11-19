import React from 'react'
import '../styles/Reportes.css'
import { useNavigate } from 'react-router-dom'


const Reportes = () => {
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