import React, { useState } from "react";
import "../styles/Salas.css";
import { useNavigate } from "react-router-dom";
import { useObtenerSalas } from "../context/Fetch";
import TablaReporte from "../components/TablaReporte";

const Salas = () => {
  const navigate = useNavigate();
  const { data: salasResponse, isLoading, fetchData } = useObtenerSalas();
  const [newSala, setNewSala] = useState({
    nombre_sala: "",
    edificio: "",
    capacidad: "",
    tipo_sala: "libre",
  });
  const [error, setError] = useState(null);

  const salas = salasResponse?.salas || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSala((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3000/api/salas/crear-sala?nombre_sala=${newSala.nombre_sala}&edificio=${newSala.edificio}&capacidad=${newSala.capacidad}&tipo_sala=${newSala.tipo_sala}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al crear sala");
      }
      fetchData(); // Refresh list
      setNewSala({
        nombre_sala: "",
        edificio: "",
        capacidad: "",
        tipo_sala: "libre",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (nombre_sala, edificio) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la sala ${nombre_sala}?`))
      return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/salas/borrar-sala?nombre_sala=${nombre_sala}&edificio=${edificio}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar sala");
      }
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = ["Nombre", "Edificio", "Capacidad", "Tipo", "Acciones"];
  const rows = salas.map((s) => s.nombre_sala);
  const data = salas.map((s) => [
    s.nombre_sala,
    s.edificio,
    s.capacidad,
    s.tipo_sala,
    <button
      onClick={() => handleDelete(s.nombre_sala, s.edificio)}
      className="btn-delete"
    >
      Eliminar
    </button>,
  ]);

  if (isLoading) return <p>Cargando salas...</p>;

  const uniqueEdificios = [...new Set(salas.map((s) => s.edificio))];

  return (
    <div className="salas-page">
      <header className="salas-header">
        <button className="pill-btn back" onClick={() => navigate(-1)}>
          VOLVER
        </button>
        <h1 className="salas-title">GESTIÓN DE SALAS</h1>
        <button className="pill-btn profile">MI PERFIL</button>
      </header>

      <main className="salas-content">
        <div className="salas-form-container">
          <h2>Crear Nueva Sala</h2>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit} className="salas-form">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre_sala"
                value={newSala.nombre_sala}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Ej: A201"
              />
            </div>
            <div className="form-group">
              <label>Edificio:</label>
              <select
                name="edificio"
                value={newSala.edificio}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Seleccionar...</option>
                {uniqueEdificios.map((edificio) => (
                  <option key={edificio} value={edificio}>
                    {edificio}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Capacidad:</label>
              <input
                type="number"
                name="capacidad"
                value={newSala.capacidad}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Ej: 30"
              />
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select
                name="tipo_sala"
                value={newSala.tipo_sala}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="libre">Libre</option>
                <option value="postgrado">Postgrado</option>
                <option value="docente">Docente</option>
              </select>
            </div>
            <button type="submit" className="btn-create">
              CREAR
            </button>
          </form>
        </div>

        <div className="salas-list-container">
          <TablaReporte columns={columns} rows={rows} data={data} />
        </div>
      </main>
    </div>
  );
};

export default Salas;
