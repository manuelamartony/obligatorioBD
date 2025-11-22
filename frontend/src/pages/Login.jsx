import React, { useContext, useEffect } from "react";
import { Form, useActionData, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { AuthContext } from "../context/AuthContext";

export async function loginAction({ request }) {
    const formData = await request.formData();
    const correo = formData.get("userOrEmail");
    const contrasena = formData.get("password");

    const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
    });

    if (!res.ok) {
        return { error: "Credenciales incorrectas" };
    }

    const loginResp = await res.json();

    const token = loginResp.token;
    console.log(loginResp);
    const userData = loginResp.participante;

    if (!token || !userData) {
        return { error: "Error procesando la respuesta del servidor" };
    }

    return {
        user: userData,
        token: token,
    };
}

export default function Login() {
    const data = useActionData();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (data?.user && data?.token) {
            login(data.user, data.token);
            navigate("/my/panel");
        }
    }, [data]);

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

                    {data?.error && (
                        <p style={{ color: "red", marginTop: "8px" }}>
                            {data.error}
                        </p>
                    )}

                    <button type="submit" className="interface-btn">
                        Ingresar
                    </button>
                </Form>
            </div>
        </div>
    );
}
