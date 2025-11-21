from fastapi import APIRouter, Query
from src.controllers import salas_controller
from src.models.sala_models import TipoSala

router = APIRouter()

@router.get("/")
async def obtener_salas():
    return await salas_controller.obtener_todas_las_salas()

@router.get("/{sala}/disponibilidad")
async def obtener_disponibilidad_sala(
    sala: str,
    turno: int = Query(...),
    fecha: str = Query(...),
):
    return await salas_controller.obtener_disponibilidad_sala(sala, turno, fecha)

          
@router.post("/crear-sala")
async def crear_sala(nombre_sala:str,edificio:str,capacidad:int,tipo_sala:TipoSala):
    return await salas_controller.crear_sala(nombre_sala,edificio,capacidad,tipo_sala)

@router.delete("/borrar-sala")
async def borrar_sala(nombre_sala:str,edificio:str):
    return await salas_controller.borrar_sala(nombre_sala,edificio)

@router.patch("/modificar-sala")
async def modificar_sala(nombre_sala: str, edificio: str, capacidad: int, tipo_sala: TipoSala):
    return await salas_controller.modificar_sala(nombre_sala,edificio,capacidad,tipo_sala)