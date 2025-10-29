import React from 'react'
import '../styles/NuevaReserva.css'
import { useNavigate } from 'react-router-dom'

const salas = [
    { id: 1, name: 'SALÓN 1', color: 'lavender' },
    { id: 2, name: 'SALÓN 2', color: 'mint' },
    { id: 3, name: 'SALÓN 3', color: 'mint' },
    { id: 4, name: 'SALÓN 4', color: 'orange' },
    { id: 5, name: 'SALÓN 5', color: 'orange' },
    { id: 6, name: 'SALÓN 6', color: 'lavender' }
]

const NuevaReserva = () => {
    const navigate = useNavigate();
    return (
        <div className="nueva-reserva-page">
            <header className="nr-header">
                <button className="pill-btn back" onClick={() => { navigate(-1) }}>VOLVER</button>
                <h1 className="nr-title">NUEVA RESERVA</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <div className="search-wrap">
                <input className="search-input" placeholder="Buscar sala" aria-label="Buscar sala" />
            </div>

            <main className="salas-grid">
                {salas.map((s) => (
                    <button key={s.id} className={`sala-btn ${s.color}`}>{s.name}</button>
                ))}
            </main>
        </div>
    )
}

export default NuevaReserva