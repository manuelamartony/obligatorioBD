# Guía de Migración: Node.js a FastAPI

Este documento describe la migración del backend de Node.js/Express a Python/FastAPI.

## Cambios Realizados

### Estructura del Proyecto

La estructura se mantiene similar, pero ahora con archivos Python:

```
backend/
├── src/
│   ├── config/
│   │   └── database.py          # Configuración MySQL (Python)
│   ├── controllers/             # Controladores convertidos a Python
│   │   ├── auth_controller.py
│   │   ├── facultades_controller.py
│   │   ├── participantes_controller.py
│   │   ├── reportes_controller.py
│   │   ├── reservas_controller.py
│   │   ├── salas_controller.py
│   │   └── turnos_controller.py
│   ├── routes/                  # Routers de FastAPI
│   │   ├── auth_routes.py
│   │   ├── facultades_routes.py
│   │   ├── participantes_routes.py
│   │   ├── reportes_routes.py
│   │   ├── reservas_routes.py
│   │   ├── salas_routes.py
│   │   └── turnos_routes.py
│   └── main.py                  # Aplicación FastAPI principal
├── requirements.txt             # Dependencias Python
├── Dockerfile                   # Docker para Python
└── run.py                       # Script de ejecución
```

### Principales Diferencias

1. **Framework**: Express.js → FastAPI
2. **Base de datos**: `mysql2/promise` → `mysql-connector-python`
3. **Validación**: Manual → Pydantic models
4. **Async/Await**: Promesas de JavaScript → async/await de Python

### Endpoints Mantenidos

Todos los endpoints del backend original se mantienen con la misma estructura:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/reservas?ci=...`
- `POST /api/reservas`
- `GET /api/salas`
- `GET /api/turnos`
- `GET /api/reportes/*`
- `GET /api/facultades`
- `GET /api/participantes`

### Ejecución

#### Desarrollo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python run.py
# O
uvicorn src.main:app --reload
```

#### Con Docker

```bash
docker-compose up backend
```

### Variables de Entorno

Las mismas variables de entorno del proyecto Node.js funcionan:

```env
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_NAME=obligatorio_bd
DB_PORT=3306
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Documentación API

FastAPI genera automáticamente documentación interactiva:

- **Swagger UI**: http://localhost:3000/docs
- **ReDoc**: http://localhost:3000/redoc

### Notas Importantes

1. **Archivos Node.js**: Los archivos `.js` originales se mantienen en el proyecto pero ya no se utilizan. Puedes eliminarlos cuando estés seguro de que todo funciona.

2. **Base de datos**: La estructura de la base de datos no cambió. El backend Python usa la misma base de datos MySQL.

3. **Frontend**: No requiere cambios. Los endpoints mantienen la misma estructura de respuesta.

4. **Autenticación**: Se mantiene el sistema mock de tokens. Para producción, implementa JWT como en el proyecto original.

### Próximos Pasos

1. Probar todos los endpoints
2. Verificar compatibilidad con el frontend
3. Considerar eliminar archivos Node.js antiguos
4. Implementar autenticación JWT si es necesario para producción

