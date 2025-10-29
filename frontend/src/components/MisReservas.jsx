import React from 'react'
import '../styles/MisReservas.css'

const reservations = [
    {
        id: 1,
        title: 'SALÓN M103',
        color: 'lavender',
        details: [
            'Numero reserva',
            'Participantes',
            'Edificio',
            'Capacidad',
            'Tipo de sala',
            'Estado (activa, etc)'
        ],

    },
    {
        id: 2,
        title: 'SALÓN 206',
        color: 'orange',
        details: [
            'Numero reserva',
            'Participantes',
            'Edificio',
            'Capacidad',
            'Tipo de sala',
            'Estado (activa, etc)'
        ],

    },
    {
        id: 3,
        title: 'SALÓN TI3',
        color: 'mint',
        details: [
            'Numero reserva',
            'Participantes',
            'Edificio',
            'Capacidad',
            'Tipo de sala',
            'Estado (activa, etc)'
        ],

    }
]

const MisReservas = () => {
    return (
        <div className="misreservas-page">
            <header className="mr-header">
                <button className="pill-btn back">VOLVER</button>
                <div className="header-center">
                    <div className="icon-circle">🌱</div>
                    <h1 className="page-title">MIS RESERVAS</h1>
                </div>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <main className="reservas-main">
                <div className="reservas-grid">
                    {reservations.map((r) => (
                        <article key={r.id} className={`res-card ${r.color}`}>
                            <h2 className="res-title">{r.title}</h2>
                            <div className="divider" />
                            <ul className="res-details">
                                {r.details.map((d, idx) => (
                                    <li key={idx}>{d}</li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default MisReservas