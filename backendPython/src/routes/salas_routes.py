from fastapi import APIRouter, Query
from src.controllers import salas_controller

router = APIRouter()

@router.get("/")
async def obtener_salas(tipo_sala: str = Query(None)):
    return await salas_controller.obtener_salas(tipo_sala)

@router.get("/{nombre}/disponibilidad")
async def obtener_disponibilidad_sala(
    nombre: str,
    fecha: str = Query(...),
    edificio: str = Query(...)
):
    return await salas_controller.obtener_disponibilidad_sala(nombre, fecha, edificio)

@router.get("/edificios/todos")
async def obtener_edificios():
    return await salas_controller.obtener_edificios()

@router.get("/edificio/{edificio}")
async def obtener_salas_por_edificio(edificio: str):
    return await salas_controller.obtener_salas_por_edificio(edificio)

