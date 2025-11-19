"use client";

import React, { useEffect, useState } from 'react'
import '../styles/NuevaReserva.css'
import { data, useNavigate } from 'react-router-dom'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import TurnosPopup from '../components/TurnosPopup';


export async function getSalonesFromAPI() {
    const resSalones = await fetch('http://localhost:3000/api/salas');
    const dataSalones = await resSalones.json()
    return dataSalones
}


const NuevaReserva = () => {
    const [salones, setSalones] = useState([])

    useEffect(() => {
        async function fetchSalones() {
            const dataAPI = await getSalonesFromAPI();
            setSalones(dataAPI.salas);
        }
        fetchSalones();
    }, []);

    const navigate = useNavigate();
    return (
        <div className="nueva-reserva-page">
            <header className="nr-header">
                <button className="pill-btn back" onClick={() => { navigate(-1) }}>VOLVER</button>
                <h1 className="nr-title">NUEVA RESERVA</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <main className="salas-grid">
                {salones &&
                    salones.map((s) => (
                        <Popup
                            trigger={
                                <div key={s.id} className="sala-card">
                                    <button className="sala-btn mint">
                                        {s.nombre_sala}
                                    </button>

                                    <div className="sala-details">
                                        <p><strong>Edificio:</strong> {s.edificio}</p>
                                        <p><strong>Capacidad:</strong> {s.capacidad}</p>
                                        <p><strong>Tipo:</strong> {s.tipo_sala}</p>
                                    </div>
                                </div>
                            }
                            modal
                            nested
                            className="turnos-modal"
                        >
                            <TurnosPopup sala={s} />
                        </Popup>


                    ))}

            </main>
        </div>
    )
}

export default NuevaReserva