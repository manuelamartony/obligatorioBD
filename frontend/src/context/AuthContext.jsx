"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { router } from "../App";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [sancionesActivas, setSancionesActivas] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));

        setLoading(false);
    }, []);

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", accessToken);
    };

    const logout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            console.error("Error al desconectar del backend:", e);
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        router.navigate("/login");
    };

    useEffect(() => {
        if (!user?.ci) return;

        (async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/sanciones/${user.ci}/sanciones`);
                const json = await res.json();

                const hoy = new Date();

                const activas = (json.sanciones || []).filter(s => {
                    const inicio = new Date(s.fecha_inicio);
                    const fin = new Date(s.fecha_fin);
                    return inicio <= hoy && hoy <= fin;
                });

                setSancionesActivas(activas);
            } catch (err) {
                console.error("Error obteniendo sanciones:", err);
                setSancionesActivas([]);
            }
        })();
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, sancionesActivas }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
