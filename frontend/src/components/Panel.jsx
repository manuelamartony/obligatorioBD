import React from 'react'
import { Link } from 'react-router-dom'
import "../Panel.css"
import PanelImage from "../../public/gente-feliz.avif"


const Panel = () => {
    return (
        <div className="container">
            <div className="left-section">
                <div className="panel-card">
                    <svg className='panelIcon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="M410-120v-238L204-239l-70-121 206-120-206-119 70-121 206 119v-239h140v239l206-119 70 121-206 119 206 120-70 121-206-119v238H410Z" /></svg>
                    <h2>RESERVA <br />SALONES</h2>
                </div>

                <img src={PanelImage} alt="Gente Feliz" className='panel-imgCard' />
            </div>

            <div className="right-section">
                <div className="profile-container">
                    <button className="profile">
                        Buenas, Usuario!
                    </button>
                </div>
                <div className="my-reserves">
                    <Link to="/my/panel/mis-reservas">MIS RESERVAS</Link>
                </div>
                <div className="new-reserve">
                    <Link to="">NUEVA RESERVA</Link>
                </div>
                <div className="available-rooms">
                    <Link to="">SALAS DISPONIBLES</Link>

                    <hr />
                    MIS RESERVAS
                </div>
                <div className="new-reserve">
                    <hr />
                    NUEVA RESERVA
                </div>
                <div className="available-rooms">
                    <hr />
                    REPORTES

                </div>
            </div>
        </div>
    )
}

export default Panel