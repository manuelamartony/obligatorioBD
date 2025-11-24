import React, { useState } from "react";
import "../styles/Participantes.css";
import { useNavigate } from "react-router-dom";
import { useObtenerParticipantes, useObtenerCarreras } from "../context/Fetch";
import TablaReporte from "../components/TablaReporte";

const Participantes = () => {
  const navigate = useNavigate();
  const { data: participantesResponse, isLoading, fetchData } = useObtenerParticipantes();
  const { data: carrerasResponse, isLoading: carrerasLoading } = useObtenerCarreras();
  const [newUser, setNewUser] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    isUser: false,
    rol: "",
    nombre_carrera: "",
  });
  const [error, setError] = useState(null);

  const participantes = participantesResponse?.participantes || [];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let url = `http://localhost:3000/api/participantes/crear-usuario/${newUser.ci}?nombre=${newUser.nombre}&apellido=${newUser.apellido}&email=${newUser.email}`;
      
      if (newUser.isUser && newUser.contrasena) {
        url += `&contrasena=${newUser.contrasena}`;
      }
      
      if (newUser.rol && newUser.nombre_carrera) {
        url += `&rol=${newUser.rol}&nombre_carrera=${encodeURIComponent(newUser.nombre_carrera)}`;
      }

      const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear usuario");
      }
      fetchData(); // Refresh list
      setNewUser({
        ci: "",
        nombre: "",
        apellido: "",
        email: "",
        contrasena: "",
        isUser: false,
        rol: "",
        nombre_carrera: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (ci) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario con CI ${ci}?`)) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/participantes/borrar-usuario/${ci}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar usuario");
      }
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = ["Nombre", "Apellido", "Email", "Acciones"];
  const rows = participantes.map((p) => p.ci.toString());
  const data = participantes.map((p) => [
    p.nombre,
    p.apellido,
    p.email,
    <button onClick={() => handleDelete(p.ci)} className="btn-delete">
      Eliminar
    </button>,
  ]);

  if (isLoading) return <p>Cargando participantes...</p>;

  return (
    <div className="participantes-page">
      <header className="participantes-header">
        <button className="pill-btn back" onClick={() => navigate(-1)}>
          VOLVER
        </button>
        <h1 className="participantes-title">GESTIÓN DE PARTICIPANTES</h1>
        
      </header>

      <main className="participantes-content">
        <div className="participantes-form-container">
          <h2>Crear Nuevo Participante</h2>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit} className="participantes-form">
            <div className="form-group">
              <label>CI:</label>
              <input
                type="number"
                name="ci"
                value={newUser.ci}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Ej: 12345678"
              />
            </div>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={newUser.nombre}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Nombre"
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido"
                value={newUser.apellido}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Apellido"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label>Rol:</label>
              <select
                name="rol"
                value={newUser.rol}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Seleccionar...</option>
                <option value="alumno">Alumno</option>
                <option value="docente">Docente</option>
              </select>
            </div>
            <div className="form-group">
              <label>Carrera:</label>
              <select
                name="nombre_carrera"
                value={newUser.nombre_carrera}
                onChange={handleInputChange}
                className="form-select"
                disabled={carrerasLoading}
              >
                <option value="">Seleccionar...</option>
                {carrerasResponse?.carreras?.map((carrera) => (
                  <option key={carrera.nombre_carrera} value={carrera.nombre_carrera}>
                    {carrera.nombre_carrera} ({carrera.tipo})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ marginBottom: 0 }}>Es Usuario:</label>
              <input
                type="checkbox"
                name="isUser"
                checked={newUser.isUser}
                onChange={handleInputChange}
                className="form-checkbox"
              />
            </div>
            {newUser.isUser && (
                <div className="form-group">
                <label>Contraseña:</label>
                <input
                    type="password"
                    name="contrasena"
                    value={newUser.contrasena}
                    onChange={handleInputChange}
                    required={newUser.isUser}
                    className="form-input"
                    placeholder="******"
                />
                </div>
            )}
            <button type="submit" className="btn-create">
              CREAR
            </button>
          </form>
        </div>

        <div className="participantes-list-container">
          <TablaReporte columns={columns} rows={rows} data={data} firstColHeader="CI" />
        </div>
      </main>
    </div>
  );
};

export default Participantes;
