import React from "react";
import { Form, useActionData, redirect, Link } from "react-router-dom";
import "../styles/Login.css";

// Action que recibe los datos del formulario
export async function loginAction({ request }) {
    const formData = await request.formData();
    const email = formData.get("userOrEmail"); //Obtener email
    const password = formData.get("password"); //Obtener password

    console.log("Email:", email, "Password:", password);
}

export default function Login() {
    const data = useActionData();

    return (
        <div className='login-body'>
            <div className='login-container'>
                <h1 id="login-title">LOGIN</h1>

                <Form method="post" className='loginInterface-container'>
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
                    <Link to="/my/panel">
                        <button type="submit" className="interface-btn">
                            Ingresar
                        </button>
                    </Link>

                </Form>
            </div>
        </div>
    );
}
