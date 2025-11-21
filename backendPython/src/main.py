from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from src.config.database import test_connection
from src.routes import auth_routes, reservas_routes, salas_routes, turnos_routes
from src.routes import reportes_routes, facultades_routes, participantes_routes, sanciones_routes

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    test_connection()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="API de Sistema de Reservas de Salones",
    description="Backend API para sistema de reservas de salones",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
cors_origin = os.getenv('CORS_ORIGIN', 'http://localhost:5173')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(reservas_routes.router, prefix="/api/reservas", tags=["reservas"])
app.include_router(salas_routes.router, prefix="/api/salas", tags=["salas"])
app.include_router(turnos_routes.router, prefix="/api/turnos", tags=["turnos"])
app.include_router(reportes_routes.router, prefix="/api/reportes", tags=["reportes"])
app.include_router(facultades_routes.router, prefix="/api", tags=["facultades"])
app.include_router(participantes_routes.router, prefix="/api/participantes", tags=["participantes"])
app.include_router(sanciones_routes.router,prefix="/api/sanciones",tags=["sanciones"])

@app.get("/")
async def root():
    return {
        "success": True,
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
            "health": "/api/health",
            "sanciones": "/api/sanciones"
        }
    }

@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "message": "API funcionando correctamente",
        "environment": os.getenv('NODE_ENV', 'development')
    }

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Ruta no encontrada",
            "path": str(request.url.path),
            "method": request.method
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 3000))
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"🚀 Servidor ejecutándose en puerto {port}")
    print(f"📍 URL: http://localhost:{port}")
    print(f"🌍 Entorno: {os.getenv('NODE_ENV', 'development')}")
    print(f"🔗 API Base: http://localhost:{port}/api")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("\nEndpoints disponibles:")
    print("  POST   /api/auth/login")
    print("  POST   /api/auth/logout")
    print("  GET    /api/auth/me")
    print("  GET    /api/reservas")
    print("  POST   /api/reservas")
    print("  GET    /api/salas")
    print("  GET    /api/turnos")
    print("  GET    /api/reportes/*")
    print("  GET    /api/facultades")
    print("  GET    /api/participantes")
    print("  GET    /api/sanciones")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    # Ejecutar desde el directorio backend: uvicorn src.main:app --reload
    # O ejecutar este archivo directamente: python -m src.main
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)

