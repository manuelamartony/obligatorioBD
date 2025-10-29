import React from 'react'
import "../styles/Login.css"

const Login = () => {
    return (
        <div className='login-body'>
            <div className='login-container'>
                <h1 id="login-title">LOGIN</h1>

                <form className='loginInterface-container' >
                    <h3 className="interface-title">USUARIO</h3>
                    <input
                        className="interface-input"
                        type="text"
                        placeholder="Nombre de usuario o mail"
                        name="userOrEmail"
                        required
                    />

                    <h3 className="interface-title">CONTRASEÑA</h3>
                    <input
                        className="interface-input"
                        type="password"
                        placeholder="Contraseña"
                        name="password"
                        required
                    />

                    <button type="submit" className="interface-btn">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login