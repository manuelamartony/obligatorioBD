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

@router.get("/ocupacion_salas_por_edificio")
async def ocupacion_salas_por_edificio(
    
):
    return await reportes_controller.ocupacion_salas_por_edificio()

@router.get("/cantidad_reservas_asistencias_profesores_alumnos")
async def cantidad_reservas_asistencias_profesores_alumnos(
    
):
    return await reportes_controller.cantidad_reservas_asistencias_profesores_alumnos()

@router.get("/cantidad_sanciones_profesores_alumnos")
async def cantidad_sanciones_profesores_alumnos(
    
):
    return await reportes_controller.cantidad_sanciones_profesores_alumnos()

@router.get("/reservas_utilizadas_vs_canceladas_noAsistidas")
async def reservas_utilizadas_vs_canceladas_noAsistidas(
    
):
    return await reportes_controller.reservas_utilizadas_vs_canceladas_noAsistidas()

@router.get("/tasa_cancelacion_por_participante")
async def tasa_cancelacion_por_participante(
    
):
    return await reportes_controller.tasa_cancelacion_por_participante()