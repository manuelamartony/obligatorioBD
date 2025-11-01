# Backend FastAPI - Sistema de Reservas de Salones

Backend API desarrollado con FastAPI para el sistema de reservas de salones.

> **Nota**: Este proyecto fue migrado de Node.js/Express a Python/FastAPI. El código legacy de Node.js ha sido eliminado.

## Requisitos

- Python 3.11 o superior
- MySQL 8.0 o superior

## Instalación

### Opción 1: Sin entorno virtual (más simple)

1. Instalar dependencias:
```bash
# En macOS/Linux usa python3 y pip3
pip3 install -r requirements.txt
```

2. Configurar variables de entorno:
```bash
# Crear archivo .env (si no existe .env.example, crear uno manualmente)
# Variables necesarias:
# DB_HOST=localhost
# DB_USER=dbuser
# DB_PASSWORD=dbpassword
# DB_NAME=obligatorio_bd
# DB_PORT=3306
# PORT=3000
# CORS_ORIGIN=http://localhost:5173
```

3. Ejecutar el servidor:
```bash
python3 run.py
```

O usando uvicorn directamente:
```bash
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 3000 --reload
```

### Opción 2: Con entorno virtual (recomendado)

1. Crear y activar entorno virtual:
```bash
python3 -m venv venv
source venv/bin/activate  # En macOS/Linux
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Ejecutar el servidor:
```bash
python run.py
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.py      # Configuración de base de datos
│   ├── controllers/         # Lógica de negocio
│   ├── routes/              # Definición de rutas
│   └── main.py              # Aplicación principal
├── requirements.txt
├── Dockerfile
└── README.md
```

## Endpoints

- `/api/auth` - Autenticación
- `/api/reservas` - Gestión de reservas
- `/api/salas` - Información de salas
- `/api/turnos` - Gestión de turnos
- `/api/reportes` - Reportes del sistema
- `/api/facultades` - Información de facultades
- `/api/participantes` - Gestión de participantes

## Documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva en:
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

