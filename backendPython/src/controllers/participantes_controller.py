from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_participante(ci: str):
    """Obtener datos de un participante específico"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT ci, nombre, apellido, email FROM participante WHERE ci = %s',
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

        # Obtener programas académicos del participante
        cursor.execute(
            """SELECT
                pa.nombre_programa,
                pa.tipo,
                pa.id_facultad,
                f.nombre_facultad
            FROM participante_programa_académico ppa
            INNER JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
            INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
            WHERE ppa.ci = %s""",
            (ci,)
        )
        programas = cursor.fetchall()

        cursor.close()
        conn.close()

        participante['programas'] = programas

        return {
            "success": True,
            "participante": participante
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al obtener participante: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_sanciones(ci: str):
    """Obtener sanciones de un participante"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """SELECT
                fecha_inicio,
                fecha_fin,
                CASE
                    WHEN fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE() THEN TRUE
                    ELSE FALSE
                END as activa,
                DATEDIFF(fecha_fin, fecha_inicio) as duracion_dias
            FROM sancion_participante
            WHERE ci = %s
            ORDER BY fecha_inicio DESC""",
            (ci,)
        )
        sanciones = cursor.fetchall()

        cursor.close()
        conn.close()

        sanciones_activas = [s for s in sanciones if s['activa']]

        return {
            "success": True,
            "ci": int(ci),
            "total_sanciones": len(sanciones),
            "sanciones_activas": len(sanciones_activas),
            "sanciones": sanciones
        }

    except Exception as error:
        print(f'Error al obtener sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def verificar_sanciones_activas(ci: str):
    """Verificar si un participante tiene sanciones activas"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """SELECT
                fecha_inicio,
                fecha_fin
            FROM sancion_participante
            WHERE ci = %s AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()""",
            (ci,)
        )
        sanciones = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "ci": int(ci),
            "tiene_sanciones_activas": len(sanciones) > 0,
            "cantidad": len(sanciones),
            "sanciones": sanciones
        }

    except Exception as error:
        print(f'Error al verificar sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_todos_participantes(rol: str = None, limit: int = 50, offset: int = 0):
    """Obtener todos los participantes (con paginación opcional)"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT DISTINCT p.ci, p.nombre, p.apellido, p.email
            FROM participante p
            LEFT JOIN participante_programa_académico ppa ON p.ci = ppa.ci
        """
        params = []

        if rol:
            query += ' WHERE ppa.rol = %s'
            params.append(rol)

        query += ' ORDER BY apellido, nombre LIMIT %s OFFSET %s'
        params.extend([limit, offset])

        cursor.execute(query, params)
        participantes = cursor.fetchall()

        # Contar total
        count_query = 'SELECT COUNT(DISTINCT p.ci) as total FROM participante p'
        count_params = []
        if rol:
            count_query += ' INNER JOIN participante_programa_académico ppa ON p.ci = ppa.ci WHERE ppa.rol = %s'
            count_params.append(rol)

        cursor.execute(count_query, count_params)
        total_row = cursor.fetchone()
        total = total_row['total'] if total_row else 0

        cursor.close()
        conn.close()

        return {
            "success": True,
            "total": total,
            "limit": limit,
            "offset": offset,
            "participantes": participantes
        }

    except Exception as error:
        print(f'Error al obtener participantes: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_historial_reservas(ci: str, estado: str = None, fecha_inicio: str = None, fecha_fin: str = None):
    """Obtener historial de reservas de un participante"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT DISTINCT
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                r.estado,
                rp.fecha_solicitud_reserva as fecha_solicitud,
                t.hora_inicio,
                t.hora_fin,
                CASE 
                    WHEN rp.ci = %s AND rp.fecha_solicitud_reserva IS NOT NULL THEN TRUE 
                    ELSE FALSE 
                END as es_organizador
            FROM reserva r
            INNER JOIN turno t ON r.id_turno = t.id_turno
            INNER JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci = %s
        """

        params = [ci, ci]

        if estado:
            query += ' AND r.estado = %s'
            params.append(estado)

        if fecha_inicio and fecha_fin:
            query += ' AND r.fecha BETWEEN %s AND %s'
            params.extend([fecha_inicio, fecha_fin])

        query += ' ORDER BY r.fecha DESC, t.hora_inicio DESC'

        cursor.execute(query, params)
        reservas = cursor.fetchall()

        # Convertir time objects a strings
        for reserva in reservas:
            if reserva['hora_inicio']:
                reserva['hora_inicio'] = str(reserva['hora_inicio'])
            if reserva['hora_fin']:
                reserva['hora_fin'] = str(reserva['hora_fin'])

        cursor.close()
        conn.close()

        return {
            "success": True,
            "ci": int(ci),
            "total_reservas": len(reservas),
            "reservas": reservas
        }

    except Exception as error:
        print(f'Error al obtener historial de reservas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

