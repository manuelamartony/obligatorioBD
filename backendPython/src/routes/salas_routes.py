from fastapi import APIRouter, Query
from src.controllers import salas_controller

router = APIRouter()

@router.get("/api/salas")
async def obtener_salas():
    return await salas_controller.obtener_salas()

@router.get("/{sala}/disponibilidad")
async def obtener_disponibilidad_sala(
    sala: str,
    turno: int = Query(...),
    fecha: str = Query(...),
):
    return await salas_controller.obtener_disponibilidad_sala(sala, fecha, turno)
