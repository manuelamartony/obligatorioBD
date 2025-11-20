from fastapi import APIRouter, Query
from src.controllers import participantes_controller
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

@router.get("/")
async def obtener_todos_usuarios(
    rol: str = Query(None),
    limit: int = Query(50),
    offset: int = Query(0)
):
    return await participantes_controller.obtener_todos_usuarios(rol, limit, offset)

@router.get("/{ci}")
async def obtener_usuario(ci: str):
    return await participantes_controller.obtener_usuario(ci)

@router.get("/rol/{ci}")
async def obtener_rol_usuario(ci:int):
    return await participantes_controller.obtener_rol_usuario(ci)

@router.post("/crear-usuario/{ci}")
async def crear_usuario(ci:int,nombre:str,apellido:str,email:str):
    return await participantes_controller.crear_usuario(ci,nombre,apellido,email)

@router.delete("/borrar-usuario/{ci}")
async def borrar_usuario(ci:int):
    return await participantes_controller.borrar_usuario(ci)

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    nuevo_ci: Optional[int] = None

@router.patch("/modificar-usuario/{ci}")
async def modificar_usuario(ci: int, cambios: UsuarioUpdate):
    return await participantes_controller.modificar_usuario(
        ci,
        cambios.nombre,
        cambios.apellido,
        cambios.email,
        cambios.nuevo_ci
    )
