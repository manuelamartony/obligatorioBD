# Backend - Sistema de Reservas de Salones

Backend desarrollado con Node.js, Express y MySQL (sin ORM) para el sistema de gestión de reservas de salones académicos.

## Características

- **Framework**: Express.js
- **Base de datos**: MySQL con driver `mysql2`
- **Sin ORM**: Consultas SQL directas para máximo control
- **Sin autenticación real**: Endpoints mockeados (preparados para JWT en el futuro)
- **Sin WebSockets**: Solo API REST
- **Sin cache**: Queries directos a la base de datos

## Requisitos previos

- Node.js 18+ instalado
- MySQL 8+ ejecutándose
- Base de datos `obligatorioBD` creada y con las migraciones ejecutadas

## Instalación

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales de MySQL:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=obligatorio_bd
DB_PORT=3306
CORS_ORIGIN=http://localhost:5173
```

## Ejecutar el servidor

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de conexión MySQL
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación (mock)
│   │   ├── reservasController.js
│   │   ├── salasController.js
│   │   ├── turnosController.js
│   │   ├── reportesController.js
│   │   ├── facultadesController.js
│   │   └── participantesController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reservasRoutes.js
│   │   ├── salasRoutes.js
│   │   ├── turnosRoutes.js
│   │   ├── reportesRoutes.js
│   │   ├── facultadesRoutes.js
│   │   └── participantesRoutes.js
│   └── index.js                  # Punto de entrada de la aplicación
├── .env                          # Variables de entorno (no incluir en git)
├── .env.example                  # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## Endpoints disponibles

### Autenticación (Mock)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | `{ correo, contrasena }` |
| POST | `/api/auth/logout` | Cerrar sesión | - |
| GET | `/api/auth/me` | Usuario actual | Query: `?ci=123` |

**Ejemplo de login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"usuario@ejemplo.com","contrasena":"password123"}'
```

### Reservas

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/reservas` | Obtener reservas de usuario | Query: `?ci=123` |
| GET | `/api/reservas/:id` | Detalle de reserva | Path: `id` |
| POST | `/api/reservas` | Crear reserva | Body: ver abajo |
| PUT | `/api/reservas/:id` | Actualizar estado | Body: `{ estado }` |
| DELETE | `/api/reservas/:id` | Cancelar reserva | Path: `id` |
| POST | `/api/reservas/asistencia` | Marcar asistencia | Body: `{ id_reserva, ci }` |

**Crear reserva (POST /api/reservas):**
```json
{
  "nombre_sala": "M103",
  "edificio": "Edificio M",
  "fecha": "2024-12-15",
  "id_turno": 1,
  "ci": 12345678,
  "participantes": [87654321, 11223344]
}
```

### Salas

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/salas` | Todas las salas | Query: `?tipo_sala=aula` |
| GET | `/api/salas/:nombre/disponibilidad` | Disponibilidad de sala | Query: `?fecha=2024-12-15&edificio=M` |
| GET | `/api/salas/edificios/todos` | Todos los edificios | - |
| GET | `/api/salas/edificio/:edificio` | Salas por edificio | Path: `edificio` |

### Turnos

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/turnos` | Todos los turnos | - |
| GET | `/api/turnos/disponibles` | Turnos disponibles | Query: `?fecha=...&sala=...&edificio=...` |
| GET | `/api/turnos/:id/disponibilidad` | Disponibilidad de turno | Query: `?fecha=...&sala=...` |

### Reportes

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/reportes/salas-mas-reservadas` | Top salas reservadas | Query: `?fecha_inicio=...&fecha_fin=...` |
| GET | `/api/reportes/turnos-demandados` | Turnos más usados | Query: `?fecha_inicio=...&fecha_fin=...` |
| GET | `/api/reportes/promedio-participantes` | Promedio por sala | Query: `?fecha_inicio=...&fecha_fin=...` |
| GET | `/api/reportes/reservas-por-facultad` | Por facultad | Query: `?fecha_inicio=...&fecha_fin=...` |
| GET | `/api/reportes/ocupacion-edificios` | Ocupación edificios | Query: `?fecha=2024-12-15` |
| GET | `/api/reportes/cantidad-reservas` | Total de reservas | Query: `?fecha_inicio=...&fecha_fin=...` |
| GET | `/api/reportes/general` | Reporte general | Query: `?fecha_inicio=...&fecha_fin=...` |

**Ejemplo de reporte:**
```bash
curl "http://localhost:3000/api/reportes/salas-mas-reservadas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

### Facultades y Programas

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/facultades` | Todas las facultades | - |
| GET | `/api/programas` | Todos los programas | Query: `?id_facultad=1&tipo=grado` |
| GET | `/api/programas/tipos` | Tipos de programas | - |
| GET | `/api/facultades/:id/programas` | Programas de facultad | Path: `id_facultad` |

### Participantes

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| GET | `/api/participantes` | Todos los participantes | Query: `?rol=estudiante&limit=50` |
| GET | `/api/participantes/:ci` | Datos de participante | Path: `ci` |
| GET | `/api/participantes/:ci/sanciones` | Sanciones | Path: `ci` |
| GET | `/api/participantes/:ci/sanciones/activas` | Sanciones activas | Path: `ci` |
| GET | `/api/participantes/:ci/historial-reservas` | Historial | Path: `ci`, Query: `?estado=...` |

### Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/` | Información de la API |

## Formato de respuestas

### Respuesta exitosa:
```json
{
  "success": true,
  "data": { ... }
}
```

### Respuesta con error:
```json
{
  "error": "Mensaje descriptivo del error"
}
```

## Estados de reserva

- `activa` - Reserva confirmada y activa
- `cancelada` - Reserva cancelada por el usuario
- `sin_asistencia` - Nadie asistió a la reserva
- `finalizada` - Reserva completada exitosamente

## Roles de participantes

- `estudiante` - Estudiante regular
- `profesor` - Profesor o docente
- `administrativo` - Personal administrativo

## Tipos de salas

- `aula` - Aula de clase regular
- `laboratorio` - Laboratorio de informática o ciencias
- `auditorio` - Auditorio para eventos grandes
- `sala_reuniones` - Sala de reuniones pequeña

## Manejo de errores

El servidor maneja los siguientes códigos de error HTTP:

- `200` - Operación exitosa
- `201` - Recurso creado
- `400` - Solicitud incorrecta (validación)
- `401` - No autenticado
- `403` - Prohibido (ej. tiene sanciones)
- `404` - Recurso no encontrado
- `409` - Conflicto (ej. sala ya reservada)
- `500` - Error interno del servidor

## Notas importantes

### Autenticación Mock
Actualmente la autenticación está mockeada. Para endpoints que requieren usuario, puedes:
- Pasar el CI como query parameter: `?ci=12345678`
- Pasar el CI en header: `X-User-CI: 12345678`

En el futuro se implementará JWT.

### Transacciones
Las operaciones críticas (crear reserva, cancelar reserva) usan transacciones MySQL para mantener integridad de datos.

### Validaciones
- Verificación de disponibilidad antes de crear reserva
- Verificación de sanciones activas
- Validación de estados válidos
- Validación de campos requeridos

## Conexión desde el frontend

En tu frontend (React/Vite), configura la URL base:

```javascript
// frontend/src/lib/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  auth: {
    login: async (correo, contrasena) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      return response.json();
    }
  },
  // ... más servicios
};
```

## Testing con curl

```bash
# Health check
curl http://localhost:3000/api/health

# Obtener salas
curl http://localhost:3000/api/salas

# Obtener turnos
curl http://localhost:3000/api/turnos

# Crear reserva
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_sala": "M103",
    "edificio": "Edificio M",
    "fecha": "2024-12-15",
    "id_turno": 1,
    "ci": 12345678
  }'
```

## Solución de problemas

### Error de conexión a MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solución**: Verificar que MySQL esté ejecutándose y las credenciales en `.env` sean correctas.

### Error de base de datos no encontrada
```
Error: ER_BAD_DB_ERROR: Unknown database 'obligatorioBD'
```
**Solución**: Crear la base de datos y ejecutar las migraciones:
```bash
cd database
mysql -u root -p < migrations/001_initial_schema.sql
mysql -u root -p < migrations/002_Initial_data.sql
```

### Puerto 3000 en uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución**: Cambiar el puerto en `.env` o terminar el proceso que usa el puerto 3000.

## Documentación Swagger/OpenAPI

- UI interactiva: `http://localhost:3000/api/docs`
- Esquema JSON: `http://localhost:3000/api/docs.json`
- Archivo fuente: `backend/openapi.yaml`

### Instalación de dependencias para Swagger

Agregar dependencias e instalar:

```bash
cd backend
npm install swagger-ui-express yamljs
```
