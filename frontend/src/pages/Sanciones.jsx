import React, { useEffect, useState } from "react";
import "../styles/Participantes.css";
import { useNavigate } from "react-router-dom";

const Sanciones = () => {
    const navigate = useNavigate();

    const [sanciones, setSanciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newCi, setNewCi] = useState("");
    const [ciValid, setCiValid] = useState(null);
    const [validating, setValidating] = useState(false);
    const [newFechaInicio, setNewFechaInicio] = useState("");
    const [newFechaFin, setNewFechaFin] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingKey, setEditingKey] = useState(null);
    const [editFechaInicio, setEditFechaInicio] = useState("");
    const [editFechaFin, setEditFechaFin] = useState("");
    const [editOriginalFechaInicio, setEditOriginalFechaInicio] = useState("");

    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso + "T00:00:00");
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const fetchSanciones = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3000/api/sanciones/");
            const json = await res.json();
            setSanciones(json.sanciones || []);
        } catch (err) {
            setError("No se pudieron cargar las sanciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSanciones();
    }, []);

    const validarCI = async () => {
        if (!newCi.trim()) {
            setError("Ingrese una cédula para validar");
            return;
        }

        setValidating(true);
        setError(null);

        try {
            const res = await fetch(`http://localhost:3000/api/participantes/${newCi}`);
            setCiValid(res.ok);
            if (!res.ok) setError("Cédula no encontrada");
        } catch {
            setCiValid(false);
            setError("Error al validar");
        }

        setValidating(false);
    };

    const handleCrear = async (e) => {
        e.preventDefault();

        setError(null);
        if (ciValid !== true) return setError("Valide la cédula primero");
        if (!newFechaInicio || !newFechaFin) return setError("Ingrese fecha inicio y fin");

        setCreating(true);
        try {
            const params = new URLSearchParams({
                ci: newCi,
                fecha_inicio: newFechaInicio,
                fecha_fin: newFechaFin
            });

            const res = await fetch(
                `http://localhost:3000/api/sanciones/crear-sancion?${params.toString()}`,
                { method: "POST" }
            );

            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.detail || `Error ${res.status}`);
            }

            setNewCi("");
            setCiValid(null);
            setNewFechaInicio("");
            setNewFechaFin("");

            await fetchSanciones();
        } catch (err) {
            setError(err.message || "Error creando sanción");
        } finally {
            setCreating(false);
        }
    };

    const handleEliminar = async (s) => {
        if (!window.confirm(`Eliminar sanción de ${s.ci} desde ${formatDate(s.fecha_inicio)}?`)) return;

        try {
            const params = new URLSearchParams({
                ci: s.ci,
                fecha_inicio: s.fecha_inicio,
                fecha_fin: s.fecha_fin
            });

            const res = await fetch(
                `http://localhost:3000/api/sanciones/borrar-sancion?${params.toString()}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.detail || `Error ${res.status}`);
            }

            await fetchSanciones();
        } catch {
            setError("No se pudo eliminar la sanción");
        }
    };

    const startEdit = (s) => {
        const key = `${s.ci}|${s.fecha_inicio}`;
        setEditingKey(key);
        setEditOriginalFechaInicio(s.fecha_inicio);
        setEditFechaInicio(s.fecha_inicio);
        setEditFechaFin(s.fecha_fin);
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setEditFechaInicio("");
        setEditFechaFin("");
    };

    const saveEdit = async (s) => {
        try {
            const params = new URLSearchParams({
                ci: s.ci,
                fecha_inicio_original: editOriginalFechaInicio,
                nueva_fecha_inicio: editFechaInicio,
                nueva_fecha_fin: editFechaFin
            });

            const res = await fetch(
                `http://localhost:3000/api/sanciones/modificar-sancion?${params.toString()}`,
                { method: "PATCH" }
            );

            const text = await res.text().catch(() => "");

            if (!res.ok) {
                throw new Error(text || `Error ${res.status}`);
            }

            setEditingKey(null);
            setEditOriginalFechaInicio("");
            setEditFechaInicio("");
            setEditFechaFin("");

            await fetchSanciones();
        } catch (err) {
            setError("No se pudo actualizar la sanción: " + err.message);
        }
    };

    if (loading) return <p>Cargando sanciones...</p>;

    return (
        <div className="participantes-page">
            <header className="participantes-header">
                <button className="pill-btn back" onClick={() => navigate(-1)}>
                    VOLVER
                </button>
                <h1 className="participantes-title">GESTIÓN DE SANCIONES</h1>
            </header>

            <main className="participantes-content">
                <div className="participantes-form-container">
                    <h2>Crear Sanción</h2>
                    {error && <p className="error-msg">{error}</p>}

                    <form onSubmit={handleCrear} className="participantes-form">
                        <div className="form-group ci-group">
                            <label>CI a sancionar:</label>

                            <input
                                type="text"
                                value={newCi}
                                onChange={(e) => { setNewCi(e.target.value); setCiValid(null); }}
                                className="form-input"
                                placeholder="Ej: 12345678"
                                disabled={validating}
                            />

                            <button
                                type="button"
                                onClick={validarCI}
                                className="btn-validate"
                                disabled={validating || !newCi.trim()}
                            >
                                {validating ? "Validando..." : "Validar CI"}
                            </button>

                            {ciValid === true && <span style={{ color: "green" }}>✔</span>}
                            {ciValid === false && <span style={{ color: "red" }}>✖</span>}
                        </div>


                        <div className="form-group">
                            <label>Fecha Inicio:</label>
                            <input type="date" value={newFechaInicio} onChange={(e) => setNewFechaInicio(e.target.value)} className="form-input" />
                        </div>

                        <div className="form-group">
                            <label>Fecha Fin:</label>
                            <input type="date" value={newFechaFin} onChange={(e) => setNewFechaFin(e.target.value)} className="form-input" />
                        </div>

                        <button type="submit" className="btn-create" disabled={creating || ciValid !== true}>
                            {creating ? "Creando..." : "CREAR SANCION"}
                        </button>
                    </form>
                </div>

                <div className="participantes-list-container">
                    <h2>Lista de Sanciones</h2>
                    <table className="tabla-participantes" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>CI</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sanciones.map((s, idx) => {
                                const key = `${s.ci}|${s.fecha_inicio}`;
                                const isEditing = editingKey === key;

                                return (
                                    <tr key={idx} style={{ borderTop: "1px solid #ddd" }}>
                                        <td style={{ padding: "8px" }}>{s.ci}</td>

                                        <td style={{ padding: "8px" }}>
                                            {isEditing ? (
                                                <input type="date" value={editFechaInicio} onChange={(e) => setEditFechaInicio(e.target.value)} />
                                            ) : (
                                                formatDate(s.fecha_inicio)
                                            )}
                                        </td>

                                        <td style={{ padding: "8px" }}>
                                            {isEditing ? (
                                                <input type="date" value={editFechaFin} onChange={(e) => setEditFechaFin(e.target.value)} />
                                            ) : (
                                                formatDate(s.fecha_fin)
                                            )}
                                        </td>

                                        <td style={{ padding: "8px" }}>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => saveEdit(s)} className="pill-btn">Guardar</button>
                                                    <button onClick={cancelEdit} className="pill-btn">Cancelar</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(s)} className="pill-btn">Modificar</button>
                                                    <button onClick={() => handleEliminar(s)} className="pill-btn btn-delete">Quitar</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Sanciones;
