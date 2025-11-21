from fastapi import HTTPException
from src.config.database import get_connection
from pydantic import BaseModel
from typing import List, Optional

class CrearReservaRequest(BaseModel):
    nombre_sala: str
    edificio: str
    fecha: str
    id_turno: int
    ci: str
    participantes: Optional[List[str]] = None

class ActualizarReservaRequest(BaseModel):
    estado: str

class MarcarAsistenciaRequest(BaseModel):
    id_reserva: int
    ci: str

async def obtener_reservas(ci: str):
    """Obtener todas las reservas de un usuario"""
    try:
        if not ci:
            raise HTTPException(
                status_code=400,
                detail="CI del participante es requerido"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                r.id_turno,
                r.estado,
                COUNT(rp.ci) as participantes
            FROM reserva r
            LEFT JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci = %s
            GROUP BY r.id_reserva, r.nombre_sala, r.edificio, r.fecha, r.id_turno, r.estado
            ORDER BY r.fecha DESC
        """

        cursor.execute(query, (ci,))
        reservas = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "reservas": reservas
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al obtener reservas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def obtener_reserva_por_id(id: int):
    """Obtener detalle de una reserva específica"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """SELECT
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                r.id_turno,
                r.estado,
                t.hora_inicio,
                t.hora_fin,
                s.capacidad,
                s.tipo_sala
            FROM reserva r
            INNER JOIN turno t ON r.id_turno = t.id_turno
            INNER JOIN sala s ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
            WHERE r.id_reserva = %s""",
            (id,)
        )
        reserva_rows = cursor.fetchall()

        if len(reserva_rows) == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Reserva no encontrada"
            )

        reserva = reserva_rows[0]

        # Obtener participantes
        cursor.execute(
            """SELECT
                u.ci,
                u.nombre,
                u.apellido,
                u.email,
                rp.asistencia
            FROM reserva_participante rp
            INNER JOIN usuario u ON rp.ci = u.ci
            WHERE rp.id_reserva = %s""",
            (id,)
        )
        participantes = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "reserva": {
                **reserva,
                "participantes": participantes
            }
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error al obtener reserva: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def crear_reserva(request: CrearReservaRequest):
    """Crear nueva reserva"""
    conn = get_connection()
    
    try:
        conn.start_transaction()

        # Validaciones
        if not request.nombre_sala or not request.edificio or not request.fecha or not request.id_turno or not request.ci:
            conn.rollback()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Todos los campos son requeridos"
            )

        cursor = conn.cursor(dictionary=True)

        # Normalizar fecha a DATE (YYYY-MM-DD)
        fecha_date = request.fecha.split('T')[0] if 'T' in request.fecha else request.fecha

        # Verificar que el participante (creador) existe
        cursor.execute('SELECT ci FROM participante WHERE ci = %s', (request.ci,))
        participante_existe = cursor.fetchall()

        if len(participante_existe) == 0:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="El participante no existe"
            )

        # Verificar que la sala existe en el edificio especificado
        cursor.execute(
            'SELECT nombre_sala FROM sala WHERE nombre_sala = %s AND edificio = %s',
            (request.nombre_sala, request.edificio)
        )
        sala_existe = cursor.fetchall()

        if len(sala_existe) == 0:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="La sala no existe en el edificio especificado"
            )

        # Verificar disponibilidad de la sala en ese turno y fecha
        cursor.execute(
            """SELECT id_reserva FROM reserva
            WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
            AND estado IN ('activa', 'finalizada')""",
            (request.nombre_sala, request.edificio, fecha_date, request.id_turno)
        )
        existentes = cursor.fetchall()

        if len(existentes) > 0:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=409,
                detail="La sala ya está reservada para ese turno"
            )

        # Verificar si el participante tiene sanciones activas
        cursor.execute(
            """SELECT * FROM sancion_participante
            WHERE ci = %s AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()""",
            (request.ci,)
        )
        sanciones = cursor.fetchall()

        if len(sanciones) > 0:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=403,
                detail="No puedes realizar reservas debido a sanciones activas"
            )

        # Generar nuevo id_reserva manualmente
        cursor.execute('SELECT COALESCE(MAX(id_reserva), 0) AS maxId FROM reserva')
        max_id_row = cursor.fetchone()
        max_id = max_id_row['maxId'] if max_id_row else 0
        id_reserva = max_id + 1

        # Crear la reserva
        cursor.execute(
            """INSERT INTO reserva (id_reserva, nombre_sala, edificio, fecha, id_turno, estado)
            VALUES (%s, %s, %s, %s, %s, 'activa')""",
            (id_reserva, request.nombre_sala, request.edificio, fecha_date, request.id_turno)
        )

        # Agregar el creador de la reserva como participante
        cursor.execute(
            """INSERT INTO reserva_participante (id_reserva, ci, fecha_solicitud_reserva, asistencia)
            VALUES (%s, %s, %s, FALSE)""",
            (id_reserva, request.ci, fecha_date)
        )

        # Validar y agregar participantes adicionales si existen
        if request.participantes and len(request.participantes) > 0:
            # Verificar que todos los participantes existan
            placeholders = ','.join(['%s'] * len(request.participantes))
            cursor.execute(
                f'SELECT ci FROM participante WHERE ci IN ({placeholders})',
                tuple(request.participantes)
            )
            participantes_existentes = cursor.fetchall()

            participantes_validos = [p['ci'] for p in participantes_existentes]
            participantes_invalidos = [ci for ci in request.participantes if ci not in participantes_validos]

            if len(participantes_invalidos) > 0:
                conn.rollback()
                cursor.close()
                conn.close()
                raise HTTPException(
                    status_code=400,
                    detail=f"Algunos participantes no existen: {', '.join(participantes_invalidos)}"
                )

            # Agregar participantes adicionales
            for participante_ci in request.participantes:
                cursor.execute(
                    """INSERT INTO reserva_participante (id_reserva, ci, fecha_solicitud_reserva, asistencia)
                    VALUES (%s, %s, %s, FALSE)""",
                    (id_reserva, participante_ci, fecha_date)
                )

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "success": True,
            "id_reserva": id_reserva,
            "estado": "activa",
            "mensaje": "Reserva creada exitosamente"
        }

    except HTTPException:
        if conn:
            conn.rollback()
            conn.close()
        raise
    except Exception as error:
        if conn:
            conn.rollback()
            conn.close()
        print(f'Error al crear reserva: {error}')
        error_code = getattr(error, 'errno', None)
        if error_code == 1452:  # ER_NO_REFERENCED_ROW_2
            raise HTTPException(
                status_code=400,
                detail="Sala o edificio no existen o no coinciden"
            )
        elif error_code == 1364:  # ER_BAD_NULL_ERROR
            raise HTTPException(
                status_code=400,
                detail="Falta un valor requerido para crear la reserva"
            )
        elif hasattr(error, 'errno') and error.errno == 1062:  # ER_DUP_ENTRY
            raise HTTPException(
                status_code=409,
                detail="Ya existe una reserva con estos datos"
            )
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def actualizar_reserva(id: int, request: ActualizarReservaRequest):
    """Actualizar estado de una reserva"""
    conn = None
    cursor = None
    try:
        estados_validos = ['activa', 'cancelada', 'sin asistencia', 'finalizada']

        if not request.estado or request.estado not in estados_validos:
            raise HTTPException(
                status_code=400,
                detail=f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"
            )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE reserva SET estado = %s WHERE id_reserva = %s',
            (request.estado, id)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Reserva no encontrada"
            )

        conn.commit()

        return {
            "success": True,
            "mensaje": "Reserva actualizada exitosamente"
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as error:
        if conn:
            conn.rollback()
        print(f'Error al actualizar reserva: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def cancelar_reserva(id: int):
    """Cancelar (eliminar) una reserva"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        conn.start_transaction()
        cursor = conn.cursor(dictionary=True)

        # Verificar que la reserva exista
        cursor.execute('SELECT * FROM reserva WHERE id_reserva = %s', (id,))
        reserva = cursor.fetchall()

        if len(reserva) == 0:
            raise HTTPException(
                status_code=404,
                detail="Reserva no encontrada"
            )

        # Eliminar participantes de la reserva
        cursor.execute('DELETE FROM reserva_participante WHERE id_reserva = %s', (id,))

        # Eliminar la reserva
        cursor.execute('DELETE FROM reserva WHERE id_reserva = %s', (id,))

        conn.commit()

        return {
            "success": True,
            "mensaje": "Reserva cancelada exitosamente"
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as error:
        if conn:
            conn.rollback()
        print(f'Error al cancelar reserva: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def marcar_asistencia(request: MarcarAsistenciaRequest):
    """Marcar asistencia de un participante"""
    conn = None
    cursor = None
    try:
        if not request.id_reserva or not request.ci:
            raise HTTPException(
                status_code=400,
                detail="ID de reserva y CI son requeridos"
            )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE reserva_participante SET asistencia = TRUE WHERE id_reserva = %s AND ci = %s',
            (request.id_reserva, request.ci)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Participante no encontrado en la reserva"
            )

        conn.commit()

        return {
            "success": True,
            "mensaje": "Asistencia marcada exitosamente"
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as error:
        if conn:
            conn.rollback()
        print(f'Error al marcar asistencia: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

