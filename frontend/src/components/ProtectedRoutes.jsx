"use client";

import { AuthContext, useAuth } from "../context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";


const ProtectedRoutes = ({ roles = [] }) => {
    const { user } = useAuth();

    // 1. Si no hay usuario → debe ir al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si hay usuario pero no es student
    if (roles.length > 0 && !roles.includes(user.role)) {
        return <div>No tenés permisos para acceder a esta sección.</div>;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
