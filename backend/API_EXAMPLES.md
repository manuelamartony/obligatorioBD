# Ejemplos de Uso de la API

Colección de ejemplos usando `curl` para probar todos los endpoints de la API.

## Variables de entorno para los ejemplos

```bash
export API_URL="http://localhost:3000/api"
export CI_USUARIO=12345678
```

## 1. Autenticación

### Login

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan.perez@ucu.edu.uy",
    "contrasena": "password123"
  }'
```

**Respuesta esperada:**

```json
{
  "success": true,
  "token": "mock-token-12345678-1702843200000",
  "participante": {
    "ci": 12345678,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@ucu.edu.uy",
    "rol": "estudiante"
  }
}
```

### Logout

```bash
curl -X POST $API_URL/auth/logout
```

### Obtener usuario actual

```bash
curl "$API_URL/auth/me?ci=12345678"
```

## 2. Reservas

### Obtener reservas de un usuario

```bash
curl "$API_URL/reservas?ci=12345678"
```

### Obtener detalle de una reserva

```bash
curl "$API_URL/reservas/1"
```

### Crear nueva reserva

```bash
curl -X POST $API_URL/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_sala": "M103",
    "edificio": "Edificio M",
    "fecha": "2024-12-20",
    "id_turno": 1,
    "ci": 12345678,
    "participantes": [87654321, 11223344]
  }'
```

**Respuesta esperada:**

```json
{
  "success": true,
  "id_reserva": 15,
  "estado": "activa",
  "mensaje": "Reserva creada exitosamente"
}
```

### Actualizar estado de reserva

```bash
curl -X PUT $API_URL/reservas/1 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "finalizada"
  }'
```

Estados válidos: `activa`, `cancelada`, `sin_asistencia`, `finalizada`

### Cancelar reserva (DELETE)

```bash
curl -X DELETE $API_URL/reservas/1
```

### Marcar asistencia

```bash
curl -X POST $API_URL/reservas/asistencia \
  -H "Content-Type: application/json" \
  -d '{
    "id_reserva": 1,
    "ci": 12345678
  }'
```

## 3. Salas

### Obtener todas las salas
```bash
curl "$API_URL/salas"
```

### Obtener salas por tipo
```bash
curl "$API_URL/salas?tipo_sala=aula"
```

Tipos válidos: `aula`, `laboratorio`, `auditorio`, `sala_reuniones`

### Obtener disponibilidad de una sala
```bash
curl "$API_URL/salas/M103/disponibilidad?edificio=Edificio%20M&fecha=2024-12-20"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "sala": "M103",
  "edificio": "Edificio M",
  "fecha": "2024-12-20",
  "turnos": [
    {
      "id_turno": 1,
      "hora_inicio": "08:00:00",
      "hora_fin": "10:00:00",
      "disponible": true
    },
    {
      "id_turno": 2,
      "hora_inicio": "10:00:00",
      "hora_fin": "12:00:00",
      "disponible": false
    }
  ]
}
```

### Obtener todos los edificios
```bash
curl "$API_URL/salas/edificios/todos"
```

### Obtener salas de un edificio específico
```bash
curl "$API_URL/salas/edificio/Edificio%20M"
```

## 4. Turnos

### Obtener todos los turnos
```bash
curl "$API_URL/turnos"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "turnos": [
    {
      "id_turno": 1,
      "hora_inicio": "08:00:00",
      "hora_fin": "10:00:00"
    },
    {
      "id_turno": 2,
      "hora_inicio": "10:00:00",
      "hora_fin": "12:00:00"
    }
  ]
}
```

### Obtener turnos disponibles para una sala y fecha
```bash
curl "$API_URL/turnos/disponibles?fecha=2024-12-20&sala=M103&edificio=Edificio%20M"
```

### Verificar disponibilidad de un turno específico
```bash
# Solo para una sala
curl "$API_URL/turnos/1/disponibilidad?fecha=2024-12-20&sala=M103&edificio=Edificio%20M"

# Para todas las salas
curl "$API_URL/turnos/1/disponibilidad?fecha=2024-12-20"
```

## 5. Reportes

### Salas más reservadas
```bash
curl "$API_URL/reportes/salas-mas-reservadas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "periodo": {
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-12-31"
  },
  "salas": [
    {
      "nombre_sala": "M103",
      "edificio": "Edificio M",
      "cantidad_reservas": 45,
      "capacidad": 30,
      "tipo_sala": "aula"
    }
  ]
}
```

### Turnos más demandados
```bash
curl "$API_URL/reportes/turnos-demandados?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

### Promedio de participantes por sala
```bash
curl "$API_URL/reportes/promedio-participantes?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

### Reservas por facultad
```bash
curl "$API_URL/reportes/reservas-por-facultad?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

### Ocupación de edificios (para una fecha específica)
```bash
curl "$API_URL/reportes/ocupacion-edificios?fecha=2024-12-20"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "fecha": "2024-12-20",
  "edificios": [
    {
      "nombre_edificio": "Edificio M",
      "direccion": "8 de Octubre 2738",
      "total_salas": 10,
      "salas_utilizadas": 7,
      "ocupacion_porcentaje": 70.00,
      "total_reservas": 15
    }
  ]
}
```

### Cantidad total de reservas
```bash
# Todas las reservas
curl "$API_URL/reportes/cantidad-reservas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"

# Solo reservas activas
curl "$API_URL/reportes/cantidad-reservas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31&estado=activa"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "periodo": {
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-12-31"
  },
  "filtro_estado": "todos",
  "total_reservas": 150,
  "usuarios_unicos": 45,
  "dias_con_reservas": 120,
  "por_estado": {
    "activa": 30,
    "cancelada": 10,
    "sin_asistencia": 5,
    "finalizada": 105
  }
}
```

### Reporte general del sistema
```bash
curl "$API_URL/reportes/general?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

## 6. Facultades y Programas

### Obtener todas las facultades
```bash
curl "$API_URL/facultades"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "facultades": [
    {
      "id_facultad": 1,
      "nombre_facultad": "Ingeniería"
    },
    {
      "id_facultad": 2,
      "nombre_facultad": "Ciencias Empresariales"
    }
  ]
}
```

### Obtener todos los programas
```bash
curl "$API_URL/programas"
```

### Obtener programas por facultad
```bash
curl "$API_URL/programas?id_facultad=1"
```

### Obtener programas por tipo
```bash
curl "$API_URL/programas?tipo=grado"
```

Tipos: `grado`, `posgrado`, `diplomado`

### Obtener programas combinando filtros
```bash
curl "$API_URL/programas?id_facultad=1&tipo=grado"
```

### Obtener tipos de programas disponibles
```bash
curl "$API_URL/programas/tipos"
```

### Obtener programas de una facultad específica
```bash
curl "$API_URL/facultades/1/programas"
```

## 7. Participantes

### Obtener todos los participantes (paginado)
```bash
curl "$API_URL/participantes?limit=50&offset=0"
```

### Obtener participantes por rol
```bash
curl "$API_URL/participantes?rol=estudiante&limit=20"
```

Roles: `estudiante`, `profesor`, `administrativo`

### Obtener datos de un participante específico
```bash
curl "$API_URL/participantes/12345678"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "participante": {
    "ci": 12345678,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@ucu.edu.uy",
    "rol": "estudiante",
    "programas": [
      {
        "nombre_programa": "Ingeniería en Informática",
        "tipo": "grado",
        "id_facultad": 1,
        "nombre_facultad": "Ingeniería"
      }
    ]
  }
}
```

### Obtener sanciones de un participante
```bash
curl "$API_URL/participantes/12345678/sanciones"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "ci": 12345678,
  "total_sanciones": 2,
  "sanciones_activas": 1,
  "sanciones": [
    {
      "fecha_inicio": "2024-11-01",
      "fecha_fin": "2024-12-31",
      "activa": true,
      "duracion_dias": 60
    },
    {
      "fecha_inicio": "2024-06-01",
      "fecha_fin": "2024-06-30",
      "activa": false,
      "duracion_dias": 29
    }
  ]
}
```

### Verificar sanciones activas
```bash
curl "$API_URL/participantes/12345678/sanciones/activas"
```

### Obtener historial de reservas de un participante
```bash
# Todas las reservas
curl "$API_URL/participantes/12345678/historial-reservas"

# Filtrar por estado
curl "$API_URL/participantes/12345678/historial-reservas?estado=activa"

# Filtrar por rango de fechas
curl "$API_URL/participantes/12345678/historial-reservas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31"

# Combinación de filtros
curl "$API_URL/participantes/12345678/historial-reservas?estado=finalizada&fecha_inicio=2024-01-01&fecha_fin=2024-12-31"
```

## 8. Health Check

### Verificar estado del servidor
```bash
curl "$API_URL/health"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-12-18T10:30:00.000Z",
  "environment": "development"
}
```

### Información de la API
```bash
curl "http://localhost:3000/"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API de Sistema de Reservas de Salones",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "reservas": "/api/reservas",
    "salas": "/api/salas",
    "turnos": "/api/turnos",
    "reportes": "/api/reportes",
    "facultades": "/api/facultades",
    "programas": "/api/programas",
    "participantes": "/api/participantes",
    "health": "/api/health"
  }
}
```

## Notas importantes

### Formato de fechas
- Usar formato ISO: `YYYY-MM-DD` (ej: `2024-12-20`)
- Para horas: `HH:MM:SS` (ej: `08:00:00`)

### Codificación de URLs
Espacios y caracteres especiales deben ser codificados:
- Espacio: `%20`
- Ejemplo: `Edificio M` → `Edificio%20M`

### Headers comunes
Para POST/PUT/DELETE:
```bash
-H "Content-Type: application/json"
```

### Ver respuesta completa con headers
```bash
curl -i "$API_URL/salas"
```

### Modo verbose para debugging
```bash
curl -v "$API_URL/salas"
```

### Pretty print JSON (con jq)
```bash
curl "$API_URL/salas" | jq
```

## Scripts de prueba completos

### Script de prueba general
Crear archivo `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000/api"

echo "=== Probando Health Check ==="
curl -s "$API_URL/health" | jq

echo -e "\n=== Probando Login ==="
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan.perez@ucu.edu.uy","contrasena":"password123"}' | jq

echo -e "\n=== Probando Salas ==="
curl -s "$API_URL/salas" | jq

echo -e "\n=== Probando Turnos ==="
curl -s "$API_URL/turnos" | jq

echo -e "\n=== Probando Facultades ==="
curl -s "$API_URL/facultades" | jq

echo -e "\n=== Probando Reservas ==="
curl -s "$API_URL/reservas?ci=12345678" | jq

echo "=== Pruebas completadas ==="
```

Ejecutar:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Colección Postman

También puedes importar estos ejemplos en Postman o Insomnia creando una colección con estos endpoints.

Variables de entorno en Postman:
- `base_url`: `http://localhost:3000/api`
- `ci_usuario`: `12345678`
- `fecha_hoy`: `{{$isoTimestamp}}`
