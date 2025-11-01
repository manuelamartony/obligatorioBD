from fastapi import APIRouter, Query
from src.controllers import auth_controller
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

@router.post("/login")
async def login(request: LoginRequest):
    return await auth_controller.login(request.correo, request.contrasena)

@router.post("/logout")
async def logout():
    return await auth_controller.logout()

@router.get("/me")
async def me(ci: str = Query(None)):
    return await auth_controller.me(ci)

