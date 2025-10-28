import React from 'react'
import UCULogo from '../../public/Logo-Universidad-Catolica-cropped.svg'


const Home = () => {
    return (
        <div className="container">
            <div className="left-section">
                <div className="hero-card">
                    <h1>RESERVÁ<br />TU<br />SALA</h1>
                </div>
                <div className="login-card">
                    <button className="login-btn">INGRESA</button>
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