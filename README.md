# 📚 Sistema de Gestión de Salas de Estudio – UCU  
**Proyecto obligatorio – Base de Datos 1 – Segundo Semestre 2025**  
**Integrantes: Franco Manfredi · Manuela Martony · Manuel Lorenzo · Martín de León**

Este proyecto implementa un sistema completo para la **gestión de reservas de salas de estudio** en la Universidad Católica del Uruguay (UCU), sustituyendo el proceso manual en papel por una plataforma moderna basada en web.

El sistema permite reservar salas, registrar asistencia, aplicar sanciones automáticas por inasistencia, consultar reportes sobre el uso de los espacios y funcionalidades de administrador. Incluye frontend en **React**, backend en **Python (sin ORM)** y base de datos **MySQL**.

---

# 🚀 Características principales

## 👥 Usuarios del sistema
### Usuario común
- Crear reservas
- Ver reservas activas y pasadas
- Cancelar reservas
- Ver asistencia y estados

### Administrador
- Todo lo anterior, más:
  - Gestión de salas
  - Activación/desactivación de salas y usuarios
  - Visualización general de reservas
  - Módulo de reportes

---

# 🔐 Usuarios de prueba

### 👨‍💼 Administrador
```
Email: admin@ucu.edu.uy
Contraseña: admin123
```

### 👤 Usuario común
```
Email: agustin.ramos@ucu.edu.uy
Contraseña: qwerty98
```

---

# ⚙️ Requisitos previos

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- DataGrip u otro cliente MySQL
- npm o yarn

---

# 🛠️ Instalación y ejecución

## 1️⃣ Clonar el repositorio
```
git clone https://github.com/manuelamartony/obligatorioBD
cd obligatorioBD
```

---

El proyecto incluye un archivo `docker-compose.yml` que levanta automáticamente:

- Base de datos MySQL con el schema inicial y datos maestros  
- Backend en Python con todos los requerimientos instalados  
- Frontend en React accesible desde navegador  
- Red interna para que los servicios se comuniquen entre sí  

No es necesario instalar dependencias manualmente ni ejecutar scripts SQL a mano.

---

## 🚀 **1️⃣ Levantar todo el sistema**

Desde la raíz del proyecto:

```
docker compose up --build
```

Esto:

- Construye las imágenes (frontend, backend)
- Levanta el contenedor de MySQL
- Ejecuta automáticamente:
  - la migración `001_initial_schema.sql`
  - el archivo `datos_maestros.sql`
- Inicia frontend y backend

Cuando el proceso termina, tendrás:

### 📡 Backend disponible en:
```
http://localhost:8000
```

### 🌐 Frontend disponible en:
```
http://localhost:3000
```

---

# 🛠️ Configuración de DataGrip

## Conectar al proyecto

1. Abrir **DataGrip**
2. **New → Data Source → MySQL**
3. Configurar:
   - Host: `localhost`
   - Port: `3306`
   - Database: `obligatorio_bd`
   - User: `root`
   - Password: `rootpassword`
4. **Test Connection → OK**

---

# 🧱 Tecnologías utilizadas

## Backend
- Python (sin ORM)
- MySQL Connector
- Validaciones manuales
- Manejo explícito de transacciones
- Arquitectura modular por controladores y rutas

## Frontend
- React
- Hooks
- Fetch/Axios
- Componentes modulares

## Base de Datos
- MySQL
- Modelo altamente normalizado
- Fields `activo` para usuario y sala
- Integridad referencial completa

---

# 🗃️ Estructura del proyecto

```
/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   ├── models/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── NuevaReserva.jsx
│   │   │   ├── MisReservas.jsx
│   │   │   ├── Panel.jsx
│   │   │   └── Reportes.jsx
│   │   ├── components/
│   │   └── services/
│   └── package.json
│
└── database/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   ├── 002_descripcion_cambio.sql
    └── datos_maestros.sql
```

---
