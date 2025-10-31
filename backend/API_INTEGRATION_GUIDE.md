# Guía de Integración Frontend - Backend

Esta guía muestra cómo integrar el backend con el frontend React/Vite existente.

## 1. Crear servicio de API en el frontend

Crear el archivo `frontend/src/services/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en la solicitud");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // AUTH
  async login(correo, contrasena) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena }),
    });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.participante));
    }

    return data;
  }

  async logout() {
    const data = await this.request("/auth/logout", { method: "POST" });
    this.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return data;
  }

  async getCurrentUser(ci) {
    return this.request(`/auth/me?ci=${ci}`);
  }

  // RESERVAS
  async getReservas(ci) {
    return this.request(`/reservas?ci=${ci}`);
  }

  async getReservaById(id) {
    return this.request(`/reservas/${id}`);
  }

  async crearReserva(reservaData) {
    return this.request("/reservas", {
      method: "POST",
      body: JSON.stringify(reservaData),
    });
  }

  async actualizarReserva(id, estado) {
    return this.request(`/reservas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
  }

  async cancelarReserva(id) {
    return this.request(`/reservas/${id}`, {
      method: "DELETE",
    });
  }

  async marcarAsistencia(id_reserva, ci) {
    return this.request("/reservas/asistencia", {
      method: "POST",
      body: JSON.stringify({ id_reserva, ci }),
    });
  }

  // SALAS
  async getSalas(tipo_sala = null) {
    const query = tipo_sala ? `?tipo_sala=${tipo_sala}` : "";
    return this.request(`/salas${query}`);
  }

  async getDisponibilidadSala(nombre, edificio, fecha) {
    return this.request(
      `/salas/${nombre}/disponibilidad?edificio=${edificio}&fecha=${fecha}`
    );
  }

  async getEdificios() {
    return this.request("/salas/edificios/todos");
  }

  async getSalasPorEdificio(edificio) {
    return this.request(`/salas/edificio/${edificio}`);
  }

  // TURNOS
  async getTurnos() {
    return this.request("/turnos");
  }

  async getTurnosDisponibles(fecha, sala, edificio) {
    return this.request(
      `/turnos/disponibles?fecha=${fecha}&sala=${sala}&edificio=${edificio}`
    );
  }

  async verificarDisponibilidadTurno(id, fecha, sala = null, edificio = null) {
    const params = new URLSearchParams({ fecha });
    if (sala) params.append("sala", sala);
    if (edificio) params.append("edificio", edificio);
    return this.request(`/turnos/${id}/disponibilidad?${params.toString()}`);
  }

  // REPORTES
  async getSalasMasReservadas(fecha_inicio, fecha_fin) {
    return this.request(
      `/reportes/salas-mas-reservadas?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`
    );
  }

  async getTurnosDemandados(fecha_inicio, fecha_fin) {
    return this.request(
      `/reportes/turnos-demandados?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`
    );
  }

  async getPromedioParticipantes(fecha_inicio, fecha_fin) {
    return this.request(
      `/reportes/promedio-participantes?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`
    );
  }

  async getReservasPorFacultad(fecha_inicio, fecha_fin) {
    return this.request(
      `/reportes/reservas-por-facultad?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`
    );
  }

  async getOcupacionEdificios(fecha) {
    return this.request(`/reportes/ocupacion-edificios?fecha=${fecha}`);
  }

  async getCantidadReservas(fecha_inicio, fecha_fin, estado = null) {
    const params = new URLSearchParams({ fecha_inicio, fecha_fin });
    if (estado) params.append("estado", estado);
    return this.request(`/reportes/cantidad-reservas?${params.toString()}`);
  }

  async getReporteGeneral(fecha_inicio, fecha_fin) {
    return this.request(
      `/reportes/general?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`
    );
  }

  // FACULTADES Y PROGRAMAS
  async getFacultades() {
    return this.request("/facultades");
  }

  async getProgramas(id_facultad = null, tipo = null) {
    const params = new URLSearchParams();
    if (id_facultad) params.append("id_facultad", id_facultad);
    if (tipo) params.append("tipo", tipo);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/programas${query}`);
  }

  async getTiposProgramas() {
    return this.request("/programas/tipos");
  }

  async getProgramasPorFacultad(id_facultad) {
    return this.request(`/facultades/${id_facultad}/programas`);
  }

  // PARTICIPANTES
  async getParticipantes(rol = null, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit, offset });
    if (rol) params.append("rol", rol);
    return this.request(`/participantes?${params.toString()}`);
  }

  async getParticipante(ci) {
    return this.request(`/participantes/${ci}`);
  }

  async getSanciones(ci) {
    return this.request(`/participantes/${ci}/sanciones`);
  }

  async getSancionesActivas(ci) {
    return this.request(`/participantes/${ci}/sanciones/activas`);
  }

  async getHistorialReservas(
    ci,
    estado = null,
    fecha_inicio = null,
    fecha_fin = null
  ) {
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) params.append("fecha_fin", fecha_fin);
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/participantes/${ci}/historial-reservas${query}`);
  }
}

export const api = new ApiService();
export default api;
```

## 2. Actualizar el archivo Login.jsx

```javascript
// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(email, password);

      if (response.success) {
        login(response.participante);
        navigate("/panel");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
        disabled={loading}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
```

## 3. Actualizar MisReservas.jsx

```javascript
// frontend/src/pages/MisReservas.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const response = await api.getReservas(user.ci);

      if (response.success) {
        setReservas(response.reservas);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;

    try {
      await api.cancelarReserva(id);
      alert("Reserva cancelada exitosamente");
      cargarReservas(); // Recargar lista
    } catch (err) {
      alert("Error al cancelar: " + err.message);
    }
  };

  if (loading) return <div>Cargando reservas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mis-reservas">
      <h1>Mis Reservas</h1>

      {reservas.length === 0 ? (
        <p>No tienes reservas</p>
      ) : (
        <div className="reservas-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id_reserva} className="reserva-card">
              <h3>{reserva.nombre_sala}</h3>
              <p>Edificio: {reserva.edificio}</p>
              <p>Fecha: {new Date(reserva.fecha).toLocaleDateString()}</p>
              <p>Estado: {reserva.estado}</p>
              <p>Participantes: {reserva.participantes}</p>

              {reserva.estado === "activa" && (
                <button onClick={() => handleCancelar(reserva.id_reserva)}>
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 4. Actualizar NuevaReserva.jsx

```javascript
// frontend/src/pages/NuevaReserva.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function NuevaReserva() {
  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [edificios, setEdificios] = useState([]);

  const [edificioSeleccionado, setEdificioSeleccionado] = useState("");
  const [salaSeleccionada, setSalaSeleccionada] = useState("");
  const [fecha, setFecha] = useState("");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar edificios al montar
  useEffect(() => {
    cargarEdificios();
    cargarTurnos();
  }, []);

  // Cargar salas cuando cambia el edificio
  useEffect(() => {
    if (edificioSeleccionado) {
      cargarSalasPorEdificio(edificioSeleccionado);
    }
  }, [edificioSeleccionado]);

  const cargarEdificios = async () => {
    try {
      const response = await api.getEdificios();
      if (response.success) {
        setEdificios(response.edificios);
      }
    } catch (err) {
      console.error("Error al cargar edificios:", err);
    }
  };

  const cargarSalasPorEdificio = async (edificio) => {
    try {
      const response = await api.getSalasPorEdificio(edificio);
      if (response.success) {
        setSalas(response.salas);
      }
    } catch (err) {
      console.error("Error al cargar salas:", err);
    }
  };

  const cargarTurnos = async () => {
    try {
      const response = await api.getTurnos();
      if (response.success) {
        setTurnos(response.turnos);
      }
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const reservaData = {
        nombre_sala: salaSeleccionada,
        edificio: edificioSeleccionado,
        fecha: fecha,
        id_turno: parseInt(turnoSeleccionado),
        ci: user.ci,
      };

      const response = await api.crearReserva(reservaData);

      if (response.success) {
        alert("Reserva creada exitosamente!");
        navigate("/mis-reservas");
      }
    } catch (err) {
      setError(err.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nueva-reserva">
      <h1>Nueva Reserva</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Edificio:</label>
          <select
            value={edificioSeleccionado}
            onChange={(e) => setEdificioSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccionar edificio</option>
            {edificios.map((ed) => (
              <option key={ed.nombre_edificio} value={ed.nombre_edificio}>
                {ed.nombre_edificio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Sala:</label>
          <select
            value={salaSeleccionada}
            onChange={(e) => setSalaSeleccionada(e.target.value)}
            disabled={!edificioSeleccionado}
            required
          >
            <option value="">Seleccionar sala</option>
            {salas.map((sala) => (
              <option key={sala.nombre_sala} value={sala.nombre_sala}>
                {sala.nombre_sala} - Cap: {sala.capacidad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div>
          <label>Turno:</label>
          <select
            value={turnoSeleccionado}
            onChange={(e) => setTurnoSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccionar turno</option>
            {turnos.map((turno) => (
              <option key={turno.id_turno} value={turno.id_turno}>
                {turno.hora_inicio} - {turno.hora_fin}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Reserva"}
        </button>
      </form>
    </div>
  );
}
```

## 5. Actualizar Reportes.jsx

```javascript
// frontend/src/pages/Reportes.jsx
import { useState } from "react";
import api from "../services/api";

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporteActual, setReporteActual] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargarReporte = async (tipo) => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor selecciona las fechas");
      return;
    }

    setLoading(true);
    try {
      let response;

      switch (tipo) {
        case "salas":
          response = await api.getSalasMasReservadas(fechaInicio, fechaFin);
          break;
        case "turnos":
          response = await api.getTurnosDemandados(fechaInicio, fechaFin);
          break;
        case "promedio":
          response = await api.getPromedioParticipantes(fechaInicio, fechaFin);
          break;
        case "facultad":
          response = await api.getReservasPorFacultad(fechaInicio, fechaFin);
          break;
        case "ocupacion":
          response = await api.getOcupacionEdificios(fechaInicio);
          break;
        case "cantidad":
          response = await api.getCantidadReservas(fechaInicio, fechaFin);
          break;
        default:
          response = await api.getReporteGeneral(fechaInicio, fechaFin);
      }

      setReporteActual({ tipo, data: response });
    } catch (err) {
      alert("Error al cargar reporte: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reportes">
      <h1>Reportes</h1>

      <div className="filtros">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          placeholder="Fecha inicio"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          placeholder="Fecha fin"
        />
      </div>

      <div className="botones-reportes">
        <button onClick={() => cargarReporte("salas")}>
          Salas Más Reservadas
        </button>
        <button onClick={() => cargarReporte("turnos")}>
          Turnos Demandados
        </button>
        <button onClick={() => cargarReporte("promedio")}>
          Promedio Participantes
        </button>
        <button onClick={() => cargarReporte("facultad")}>Por Facultad</button>
        <button onClick={() => cargarReporte("ocupacion")}>
          Ocupación Edificios
        </button>
        <button onClick={() => cargarReporte("cantidad")}>
          Cantidad Reservas
        </button>
      </div>

      {loading && <div>Cargando reporte...</div>}

      {reporteActual && (
        <div className="reporte-resultado">
          <h2>Resultado: {reporteActual.tipo}</h2>
          <pre>{JSON.stringify(reporteActual.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

## 6. Configurar variable de entorno en el frontend

Crear `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 7. Actualizar AuthContext.jsx

```javascript
// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
```

## Resumen de cambios

1. **Crear servicio API**: `frontend/src/services/api.js`
2. **Actualizar Login**: Llamar a `api.login()`
3. **Actualizar MisReservas**: Cargar desde `api.getReservas()`
4. **Actualizar NuevaReserva**: Cargar opciones dinámicas y crear con `api.crearReserva()`
5. **Actualizar Reportes**: Conectar botones con endpoints reales
6. **Actualizar AuthContext**: Gestionar usuario en localStorage
7. **Configurar .env.local**: URL del backend

Con estos cambios, el frontend estará completamente integrado con el backend.
