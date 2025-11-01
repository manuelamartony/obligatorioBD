from fastapi import APIRouter, Query
from src.controllers import participantes_controller

router = APIRouter()

@router.get("/")
async def obtener_todos_participantes(
    rol: str = Query(None),
    limit: int = Query(50),
    offset: int = Query(0)
):
    return await participantes_controller.obtener_todos_participantes(rol, limit, offset)

@router.get("/{ci}")
async def obtener_participante(ci: str):
    return await participantes_controller.obtener_participante(ci)

@router.get("/{ci}/sanciones")
async def obtener_sanciones(ci: str):
    return await participantes_controller.obtener_sanciones(ci)

@router.get("/{ci}/sanciones/activas")
async def verificar_sanciones_activas(ci: str):
    return await participantes_controller.verificar_sanciones_activas(ci)

@router.get("/{ci}/historial-reservas")
async def obtener_historial_reservas(
    ci: str,
    estado: str = Query(None),
    fecha_inicio: str = Query(None),
    fecha_fin: str = Query(None)
):
    return await participantes_controller.obtener_historial_reservas(ci, estado, fecha_inicio, fecha_fin)

