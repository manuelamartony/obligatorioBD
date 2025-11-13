import React, { useState, useEffect } from 'react'
import UCULogo from '../../public/Logo-Universidad-Catolica-cropped.svg'
import { Link } from 'react-router-dom'

const Home = () => {
    const [reserva, setReserva] = useState([])
    const getReservas = async () => {
        const allReservas = await fetch('http://localhost:3000/api/reservas')
        const reservasJSON = await allReservas.json()
        console.log('Reservas:', reservasJSON);
    }

    useEffect(() => {
        getReservas()
    }, [])

    return (
        <div className="container">
            <div className="left-section">
                <div className="hero-card">
                    <h1>RESERVÁ<br />TU<br />SALA</h1>
                </div>
                <div className="login-card">
                    <Link to="/login" className="login-btn">INGRESA</Link>
                </div>
            </div>

            <div className="right-section">
                <div className="top-bar"></div>
                <img src={UCULogo} alt="Logo Universidad Católica del Uruguay" className="home-logo" />
            </div>
        </div>
    )
}

export default Home