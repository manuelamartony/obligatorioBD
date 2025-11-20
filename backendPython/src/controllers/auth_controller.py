from fastapi import HTTPException
from src.config.database import get_connection
from datetime import datetime

async def login(correo: str, contrasena: str):
    """Autenticación de usuario"""
    try:
        if not correo or not contrasena:
            raise HTTPException(
                status_code=400,
                detail="Correo y contraseña son requeridos"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Buscar el login
        cursor.execute('SELECT * FROM login WHERE correo = %s', (correo,))
        login_rows = cursor.fetchall()

        if len(login_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )

        login_data = login_rows[0]

        # En producción aquí se compararía con bcrypt
        # Por ahora comparación directa (MOCK)
        if login_data['contrasena'] != contrasena:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )

        # Buscar datos del participante usando el email del login
        cursor.execute(
            'SELECT ci, nombre, apellido, email FROM usuario WHERE email = %s',
            (correo,)
        )
        participante_rows = cursor.fetchall()

        if len(participante_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Participante no encontrado"
            )

        participante = participante_rows[0]

        # Obtener el rol del participante desde participante_carrera
        cursor.execute(
            'SELECT rol FROM participante_carrera WHERE ci = %s LIMIT 1',
            (participante['ci'],)
        )
        rol_rows = cursor.fetchall()

        rol = rol_rows[0]['rol'] if len(rol_rows) > 0 else None

        cursor.close()
        conn.close()

        # Mock token (en producción sería JWT)
        token = f"mock-token-{participante['ci']}-{int(datetime.now().timestamp() * 1000)}"

        return {
            "success": True,
            "token": token,
            "participante": {
                "ci": participante['ci'],
                "nombre": participante['nombre'],
                "apellido": participante['apellido'],
                "email": participante['email'],
                "rol": rol
            }
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en login: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def logout():
    """Cerrar sesión"""
    try:
        # En producción aquí se invalidaría el token
        return {
            "success": True,
            "message": "Sesión cerrada exitosamente"
        }
    except Exception as error:
        print(f'Error en logout: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def me(ci: str = None):
    """Obtener información del usuario actual"""
    try:
        if not ci:
            raise HTTPException(
                status_code=401,
                detail="No autenticado"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT ci, nombre, apellido, email FROM usuario WHERE ci = %s',
            (ci,)
        )
        participante_rows = cursor.fetchall()

        if len(participante_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Participante no encontrado"
            )

        participante = participante_rows[0]

        # Obtener el rol del participante desde participante_carrera
        cursor.execute(
            'SELECT rol FROM participante_carrera WHERE ci = %s LIMIT 1',
            (ci,)
        )
        rol_rows = cursor.fetchall()

        rol = rol_rows[0]['rol'] if len(rol_rows) > 0 else None

        cursor.close()
        conn.close()

        return {
            "success": True,
            "participante": {
                "ci": participante['ci'],
                "nombre": participante['nombre'],
                "apellido": participante['apellido'],
                "email": participante['email'],
                "rol": rol
            }
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en me: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

