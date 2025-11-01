from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_turnos():
    """Obtener todos los turnos disponibles"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
        )
        turnos = cursor.fetchall()

        # Convertir time objects a strings
        for turno in turnos:
            turno['hora_inicio'] = str(turno['hora_inicio'])
            turno['hora_fin'] = str(turno['hora_fin'])

        cursor.close()
        conn.close()

        return {
            "success": True,
            "turnos": turnos
        }

    except Exception as error:
        print(f'Error al obtener turnos: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def verificar_disponibilidad_turno(id: int, fecha: str, sala: str = None, edificio: str = None):
    """Verificar disponibilidad de un turno específico"""
    try:
        if not fecha:
            raise HTTPException(
                status_code=400,
                detail="Fecha es requerida"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Verificar que el turno exista
        cursor.execute('SELECT * FROM turno WHERE id_turno = %s', (id,))
        turno_rows = cursor.fetchall()

        if len(turno_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Turno no encontrado"
            )

        turno = turno_rows[0]

        # Si se especifica sala, verificar solo esa sala
        if sala and edificio:
            cursor.execute(
                """SELECT id_reserva FROM reserva
                WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
                AND estado IN ('activa', 'finalizada')""",
                (sala, edificio, fecha, id)
            )
            reservas = cursor.fetchall()

            cursor.close()
            conn.close()

            return {
                "success": True,
                "id_turno": turno['id_turno'],
                "hora_inicio": str(turno['hora_inicio']),
                "hora_fin": str(turno['hora_fin']),
                "fecha": fecha,
                "sala": sala,
                "edificio": edificio,
                "disponible": len(reservas) == 0
            }

        # Si no se especifica sala, obtener todas las salas disponibles
        cursor.execute(
            'SELECT nombre_sala, edificio FROM sala ORDER BY edificio, nombre_sala'
        )
        todas_salas = cursor.fetchall()

        cursor.execute(
            """SELECT nombre_sala, edificio FROM reserva
            WHERE fecha = %s AND id_turno = %s
            AND estado IN ('activa', 'finalizada')""",
            (fecha, id)
        )
        reservas = cursor.fetchall()

        salas_reservadas = {f"{r['nombre_sala']}|{r['edificio']}" for r in reservas}

        salas_disponibles = [
            s for s in todas_salas
            if f"{s['nombre_sala']}|{s['edificio']}" not in salas_reservadas
        ]

        cursor.close()
        conn.close()

        return {
            "success": True,
            "id_turno": turno['id_turno'],
            "hora_inicio": str(turno['hora_inicio']),
            "hora_fin": str(turno['hora_fin']),
            "fecha": fecha,
            "disponible": len(salas_disponibles) > 0,
            "total_salas": len(todas_salas),
            "salas_disponibles": salas_disponibles
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al verificar disponibilidad del turno: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_turnos_disponibles(fecha: str, sala: str, edificio: str):
    """Obtener turnos disponibles para una fecha y sala específica"""
    try:
        if not fecha or not sala or not edificio:
            raise HTTPException(
                status_code=400,
                detail="Fecha, sala y edificio son requeridos"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener todos los turnos
        cursor.execute(
            'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
        )
        turnos = cursor.fetchall()

        # Obtener reservas existentes
        cursor.execute(
            """SELECT id_turno FROM reserva
            WHERE nombre_sala = %s AND edificio = %s AND fecha = %s
            AND estado IN ('activa', 'finalizada')""",
            (sala, edificio, fecha)
        )
        reservas = cursor.fetchall()

        turnos_reservados = {r['id_turno'] for r in reservas}

        turnos_disponibles = [
            {
                "id_turno": t['id_turno'],
                "hora_inicio": str(t['hora_inicio']),
                "hora_fin": str(t['hora_fin'])
            }
            for t in turnos
            if t['id_turno'] not in turnos_reservados
        ]

        # Convertir time objects a strings en todos los turnos
        for turno in turnos:
            turno['hora_inicio'] = str(turno['hora_inicio'])
            turno['hora_fin'] = str(turno['hora_fin'])

        cursor.close()
        conn.close()

        return {
            "success": True,
            "fecha": fecha,
            "sala": sala,
            "edificio": edificio,
            "turnos_disponibles": turnos_disponibles,
            "total_turnos": len(turnos),
            "turnos_ocupados": len(turnos_reservados)
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al obtener turnos disponibles: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

