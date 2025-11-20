import { useAuth } from "../context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ({ roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>; // puede ser un spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.rol)) {
        return <div>No tenés permisos para acceder a esta sección.</div>;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
