from fastapi import APIRouter, Query
from src.controllers import facultades_controller

router = APIRouter()

@router.get("/facultades")
async def obtener_facultades():
    return await facultades_controller.obtener_facultades()

@router.get("/programas")
async def obtener_programas(
    id_facultad: int = Query(None),
    tipo: str = Query(None)
):
    return await facultades_controller.obtener_programas(id_facultad, tipo)

@router.get("/programas/tipos")
async def obtener_tipos_programas():
    return await facultades_controller.obtener_tipos_programas()

@router.get("/facultades/{id_facultad}/programas")
async def obtener_programas_por_facultad(id_facultad: int):
    return await facultades_controller.obtener_programas_por_facultad(id_facultad)

