from fastapi import APIRouter, Query
from src.controllers import reportes_controller

router = APIRouter()

@router.get("/salas-mas-reservadas")
async def salas_mas_reservadas(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...)
):
    return await reportes_controller.salas_mas_reservadas(fecha_inicio, fecha_fin)

@router.get("/turnos-demandados")
async def turnos_demandados(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...)
):
    return await reportes_controller.turnos_demandados(fecha_inicio, fecha_fin)

@router.get("/promedio-participantes")
async def promedio_participantes(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...)
):
    return await reportes_controller.promedio_participantes(fecha_inicio, fecha_fin)

@router.get("/reservas-por-facultad")
async def reservas_por_facultad(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...)
):
    return await reportes_controller.reservas_por_facultad(fecha_inicio, fecha_fin)

@router.get("/ocupacion-edificios")
async def ocupacion_edificios(fecha: str = Query(...)):
    return await reportes_controller.ocupacion_edificios(fecha)

@router.get("/cantidad-reservas")
async def cantidad_reservas(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...),
    estado: str = Query(None)
):
    return await reportes_controller.cantidad_reservas(fecha_inicio, fecha_fin, estado)

@router.get("/general")
async def reporte_general(
    fecha_inicio: str = Query(...),
    fecha_fin: str = Query(...)
):
    return await reportes_controller.reporte_general(fecha_inicio, fecha_fin)

