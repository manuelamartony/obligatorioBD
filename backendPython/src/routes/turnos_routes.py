from fastapi import APIRouter, Query
from src.controllers import turnos_controller

router = APIRouter()

@router.get("/")
async def obtener_turnos():
    return await turnos_controller.obtener_turnos()

@router.get("/disponibles")
async def obtener_turnos_disponibles(
    fecha: str = Query(...),
    sala: str = Query(...)
):
    return await turnos_controller.obtener_turnos_disponibles(fecha, sala)

@router.get("/{id}/disponibilidad")
async def verificar_disponibilidad_turno(
    id: int,
    fecha: str = Query(...),
    sala: str = Query(None),
    edificio: str = Query(None)
):
    return await turnos_controller.verificar_disponibilidad_turno(id, fecha, sala, edificio)

