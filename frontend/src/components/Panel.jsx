import React from 'react'
import { Link } from 'react-router-dom'


const Panel = () => {
    return (
        <div className="container">
            <div className="left-section">
                <div className="panel-card">
                    <h2>RESERVA <br />SALONES</h2>
                </div>
                <div className="panel-imgCard">
                    <div>AQUI VA LA IMAGEN</div>
                </div>

            </div>

            <div className="right-section">
                <div className="my-reserves">
                    MIS RESERVAS
                </div>
                <div className="new-reserve">
                    NUEVA RESERVA
                </div>
                <div className="available-rooms">
                    SALAS DISPONIBLES
                </div>
            </div>
        </div>
    )
}

export default Panel