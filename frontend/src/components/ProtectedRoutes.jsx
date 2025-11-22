import { useAuth } from "../context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ({ roles = [] }) => {
    const { user, loading, sancionesActivas } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.rol) && user.esAdmin === 0) {
        return <div>No tenés permisos para acceder a esta sección.</div>;
    }

    if (sancionesActivas.length > 0) {
        // Buscamos la sanción con fecha_fin más cercana
        const sancionMasProxima = sancionesActivas.sort(
            (a, b) => new Date(a.fecha_fin) - new Date(b.fecha_fin)
        )[0];

        const fechaFin = new Date(
            sancionMasProxima.fecha_fin + "T00:00:00"
        ).toLocaleDateString("es-UY");

        return (
            <div style={{ padding: "1rem", color: "red", fontSize: "1.2rem" }}>
                Estás sancionado hasta el <strong>{fechaFin}</strong>.
                No podés hacer ninguna reserva.
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoutes;
