"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { router } from "../App";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
