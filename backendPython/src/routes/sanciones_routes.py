from fastapi import APIRouter, Query
from src.controllers import sanciones_controller

router = APIRouter()

@router.get("/")
async def todas_las_sanciones():
    return await sanciones_controller.todas_las_sanciones()

@router.get("/{ci}/sanciones")
async def sancion_por_usuario(ci:int):
    return await sanciones_controller.sancion_por_usuario(ci)

@router.post("/crear-sancion")
async def crear_sancion_a_usuario(ci:int,fecha_inicio:str,fecha_fin:str):
    return await sanciones_controller.crear_sancion_a_usuario(ci,fecha_inicio,fecha_fin)

@router.delete("/borrar-sancion")
async def quitar_sancion_a_usuario(ci:int,fecha_inicio:str,fecha_fin:str):
    return await sanciones_controller.quitar_sancion_a_usuario(ci,fecha_inicio,fecha_fin)

@router.patch("/modificar-sancion")
async def modificar_tiempo_sancion(ci: int,
                                   fecha_inicio_original: str,
                                   nueva_fecha_inicio: str,
                                   nueva_fecha_fin: str):
    return await sanciones_controller.modificar_tiempo_sancion(
        ci, fecha_inicio_original, nueva_fecha_inicio, nueva_fecha_fin
    )
