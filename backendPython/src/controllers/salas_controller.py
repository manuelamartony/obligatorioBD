from fastapi import HTTPException, Query
from src.config.database import get_connection

async def obtener_salas(tipo_sala: str = None):
    """Obtener todas las salas (con filtro opcional por tipo)"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                s.nombre_sala,
                s.edificio,
                s.capacidad,
                s.tipo_sala,
                e.nombre_edificio,
                e.direccion
            FROM sala s
            INNER JOIN edificio e ON s.edificio = e.nombre_edificio
        """

        params = []

        if tipo_sala:
            query += ' WHERE s.tipo_sala = %s'
            params.append(tipo_sala)

        query += ' ORDER BY s.edificio, s.nombre_sala'

        cursor.execute(query, params)
        salas = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "salas": salas
        }

    except Exception as error:
        print(f'Error al obtener salas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_disponibilidad_sala(nombre: str, fecha: str, edificio: str):
    """Obtener disponibilidad de una sala específica en una fecha"""
    try:
        if not fecha or not edificio:
            raise HTTPException(
                status_code=400,
                detail="Fecha y edificio son requeridos"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Verificar que la sala exista
        cursor.execute(
            'SELECT * FROM sala WHERE nombre_sala = %s AND edificio = %s',
            (nombre, edificio)
        )
        sala_rows = cursor.fetchall()

        if len(sala_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Sala no encontrada"
            )

        # Obtener todos los turnos
        cursor.execute(
            'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
        )
        turnos = cursor.fetchall()

        # Obtener reservas existentes para esa sala y fecha
        cursor.execute(
            """SELECT id_turno FROM reserva
            WHERE nombre_sala = %s AND edificio = %s AND fecha = %s
            AND estado IN ('activa', 'finalizada')""",
            (nombre, edificio, fecha)
        )
        reservas = cursor.fetchall()

        turnos_reservados = {r['id_turno'] for r in reservas}

        # Marcar turnos como disponibles o no
        turnos_con_disponibilidad = [
            {
                "id_turno": turno['id_turno'],
                "hora_inicio": str(turno['hora_inicio']),
                "hora_fin": str(turno['hora_fin']),
                "disponible": turno['id_turno'] not in turnos_reservados
            }
            for turno in turnos
        ]

        cursor.close()
        conn.close()

        return {
            "success": True,
            "sala": nombre,
            "edificio": edificio,
            "fecha": fecha,
            "turnos": turnos_con_disponibilidad
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al obtener disponibilidad: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_edificios():
    """Obtener todos los edificios"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT nombre_edificio, direccion FROM edificio ORDER BY nombre_edificio'
        )
        edificios = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "edificios": edificios
        }

    except Exception as error:
        print(f'Error al obtener edificios: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_salas_por_edificio(edificio: str):
    """Obtener salas de un edificio específico"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """SELECT
                nombre_sala,
                edificio,
                capacidad,
                tipo_sala
            FROM sala
            WHERE edificio = %s
            ORDER BY nombre_sala""",
            (edificio,)
        )
        salas = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "edificio": edificio,
            "salas": salas
        }

    except Exception as error:
        print(f'Error al obtener salas del edificio: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

