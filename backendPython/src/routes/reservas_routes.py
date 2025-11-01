from fastapi import APIRouter, Query
from src.controllers import reservas_controller
from src.controllers.reservas_controller import (
    CrearReservaRequest,
    ActualizarReservaRequest,
    MarcarAsistenciaRequest
)

router = APIRouter()

@router.get("/")
async def obtener_reservas(ci: str = Query(...)):
    return await reservas_controller.obtener_reservas(ci)

@router.get("/{id}")
async def obtener_reserva_por_id(id: int):
    return await reservas_controller.obtener_reserva_por_id(id)

@router.post("/")
async def crear_reserva(request: CrearReservaRequest):
    return await reservas_controller.crear_reserva(request)

@router.put("/{id}")
async def actualizar_reserva(id: int, request: ActualizarReservaRequest):
    return await reservas_controller.actualizar_reserva(id, request)

@router.delete("/{id}")
async def cancelar_reserva(id: int):
    return await reservas_controller.cancelar_reserva(id)

@router.post("/asistencia")
async def marcar_asistencia(request: MarcarAsistenciaRequest):
    return await reservas_controller.marcar_asistencia(request)

