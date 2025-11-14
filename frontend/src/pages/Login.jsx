import React, { useContext, useEffect } from "react";
import { Form, useActionData, redirect, Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { AuthContext } from "../context/AuthContext";

export async function loginAction({ request }) {
    const formData = await request.formData();
    const emailOrUser = formData.get("userOrEmail");
    const password = formData.get("password");

    // 1. Login básico
    const resLogin = await fetch("http://localhost:3001/login");
    const loginData = await resLogin.json();

    const loginUser = loginData.find(
        (u) => u.correo === emailOrUser && u.contrasena === password
    );

    if (!loginUser) return { error: "Credenciales incorrectas" };

    // 2. Buscar participante
    const resPart = await fetch("http://localhost:3001/participante");
    const partData = await resPart.json();

    const participante = partData.find(p => p.email === loginUser.correo);

    if (!participante) return { error: "No se encontró participante" };

    // 3. Buscar rol académico
    const resProg = await fetch("http://localhost:3001/participante_programa_academico");
    const progData = await resProg.json();

    const academic = progData.find(a => a.ci_participante === participante.ci);

    // 4. Construir user final
    const fullUser = {
        correo: loginUser.correo,
        ci: participante.ci,
        nombre: participante.nombre,
        apellido: participante.apellido,
        role: academic?.rol ?? null,
        programa: academic?.nombre_programa ?? null,
    };

    return { user: fullUser };
}



export default function Login() {
    const data = useActionData();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (data?.user) {
            login(data.user);        // <-- actualiza contexto Y localStorage
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
                        <p style={{ color: "red", marginTop: "8px" }}>{data.error}</p>
                    )}

                    <button type="submit" className="interface-btn">
                        Ingresar
                    </button>
                </Form>
            </div>
        </div>
    );
}
