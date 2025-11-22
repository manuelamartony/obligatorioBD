import React from "react";
import "../styles/ReservaExitosaPopup.css";

const ReservaExitosaPopup = ({ onClose }) => {
    return (
        <div className="popup-exito">
            <div className="popup-card">
                <h2>¡Reserva creada con éxito! 🎉</h2>

                <p>Tu reserva fue registrada correctamente.</p>

                <button className="popup-btn" onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default ReservaExitosaPopup;
