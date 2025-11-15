import { useContext } from "react";
import { AuthContext, useAuth } from "../context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";




const ProtectedRoutes = ({ roles = [] }) => {
    const { user } = useAuth();

    // 1. Si no hay usuario → debe ir al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si hay usuario pero no es student
    if (user.role !== "alumno") {
        return <div>Error: no sos estudiante</div>;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
