from fastapi import APIRouter, Query
from src.controllers import reportes_controller

router = APIRouter()

@router.get("/salas-mas-reservadas")
async def salas_mas_reservadas(
):
    return await reportes_controller.salas_mas_reservadas()

@router.get("/turnos-demandados")
async def turnos_demandados(
):
    return await reportes_controller.turnos_mas_demandados()
@router.get("/promedios-mas-participantes-por-sala")
async def promedios_participantes_por_salas(
    
):
    return await reportes_controller.promedios_participantes_por_salas()

@router.get("/sanciones-segun-carrera")
async def sanciones_segun_carrera(
    
):
    return reportes_controller.sanciones_segun_carrera()

@router.get("/cantidad_reservas_segun_dia")
async def cantidad_reservas_segun_dia(
    
):
    return await reportes_controller.cantidad_reservas_segun_dia()