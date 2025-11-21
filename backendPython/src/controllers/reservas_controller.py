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

        # 👈 CAMBIO: convertir CI string a int
        try:
            ci_int = int(ci.strip())
        except:
            raise HTTPException(status_code=400, detail="CI inválido")

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

        cursor.execute(query, (ci_int,))  # 👈 CAMBIO: usar el entero
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

        # Validaciones generales
        if not request.nombre_sala or not request.edificio or not request.fecha or not request.id_turno or not request.ci:
            conn.rollback()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Todos los campos son requeridos"
            )

        cursor = conn.cursor(dictionary=True)

        # Normalizar fecha
        fecha_date = request.fecha.split('T')[0] if 'T' in request.fecha else request.fecha

      
        try:
            ci_creador = int(request.ci.strip())
        except:
            raise HTTPException(status_code=400, detail="El CI del creador es inválido")

        # Verificar que el creador existe
        cursor.execute('SELECT ci FROM usuario WHERE ci = %s', (ci_creador,))
        if cursor.fetchone() is None:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="El creador no existe")


        participantes_int = []
        if request.participantes:
            try:
                participantes_int = [int(ci.strip()) for ci in request.participantes]
            except:
                raise HTTPException(status_code=400, detail="Uno o más CIs de participantes son inválidos")

        # Conversión timedelta → horas
        def timedelta_a_horas(td):
            return td.total_seconds() / 3600

        # Obtener duración del turno actual
        cursor.execute(
            """SELECT hora_inicio, hora_fin FROM turno WHERE id_turno = %s""",
            (request.id_turno,)
        )
        turno = cursor.fetchone()

        hora_inicio = turno["hora_inicio"]   # timedelta
        hora_fin = turno["hora_fin"]         # timedelta

        duracion_turno = timedelta_a_horas(hora_fin - hora_inicio)

        # Sumar horas ya reservadas en ese día
        cursor.execute(
            """
            SELECT t.hora_inicio, t.hora_fin
            FROM reserva r
            INNER JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            INNER JOIN turno t ON r.id_turno = t.id_turno
            WHERE rp.ci = %s AND r.fecha = %s AND r.estado IN ('activa', 'finalizada')
            """,
            (request.ci, fecha_date)
        )

        reservas_dia = cursor.fetchall()

        horas_acumuladas = 0
        for r in reservas_dia:
            hi = r["hora_inicio"]  # timedelta
            hf = r["hora_fin"]     # timedelta
            horas_acumuladas += timedelta_a_horas(hf - hi)

        if horas_acumuladas + duracion_turno > 2:
            raise HTTPException(
                status_code=403,
                detail="No puedes reservar más de 2 horas en el mismo día"
            )

        #Verificar maximo de 3 reservas por semana
        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM reserva r
            INNER JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci = %s
            AND YEARWEEK(r.fecha, 1) = YEARWEEK(%s, 1)
            AND r.estado = 'activa'
            """,
            (request.ci, fecha_date)
        )

        count_semana = cursor.fetchone()["total"]

        if count_semana >= 3:
            raise HTTPException(
                status_code=403,
                detail="Ya tienes 3 reservas activas esta semana"
            )



        # Validar existencia de todos los participantes
        placeholders = ",".join(["%s"] * len(participantes_int))
        cursor.execute(f"SELECT ci FROM usuario WHERE ci IN ({placeholders})", tuple(participantes_int))
        existentes = {row["ci"] for row in cursor.fetchall()}

        faltantes = [ci for ci in participantes_int if ci not in existentes]
        if faltantes:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=f"Participantes no encontrados: {', '.join(map(str,faltantes))}"
            )

        # Verificar sala
        cursor.execute(
            'SELECT nombre_sala FROM sala WHERE nombre_sala = %s AND edificio = %s',
            (request.nombre_sala, request.edificio)
        )
        if cursor.fetchone() is None:
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="La sala no existe en el edificio")

        # Verificar disponibilidad
        cursor.execute(
            """SELECT id_reserva FROM reserva
            WHERE nombre_sala = %s AND edificio = %s AND fecha = %s AND id_turno = %s
            AND estado IN ('activa', 'finalizada')""",
            (request.nombre_sala, request.edificio, fecha_date, request.id_turno)
        )
        if cursor.fetchone():
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="La sala ya está reservada en ese turno")

        # Verificar sanciones
        cursor.execute(
            """SELECT * FROM sancion_participante
            WHERE ci = %s AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()""",
            (ci_creador,)
        )
        if cursor.fetchone():
            conn.rollback()
            cursor.close()
            conn.close()
            raise HTTPException(status_code=403, detail="No puedes reservar por sanciones activas")
        
        #Verificar

        # Generar nuevo id_reserva
        cursor.execute('SELECT COALESCE(MAX(id_reserva), 0) AS maxId FROM reserva')
        id_reserva = cursor.fetchone()['maxId'] + 1

        # Crear reserva
        cursor.execute(
            """INSERT INTO reserva (id_reserva, nombre_sala, edificio, fecha, id_turno, estado)
            VALUES (%s, %s, %s, %s, %s, 'activa')""",
            (id_reserva, request.nombre_sala, request.edificio, fecha_date, request.id_turno)
        )

        # INSERT creador
        cursor.execute(
            """INSERT INTO reserva_participante (id_reserva, ci, asistencia)
            VALUES (%s, %s, FALSE)""",
            (id_reserva, ci_creador)
        )

        # INSERT participantes adicionales
        for ci_p in participantes_int:
            cursor.execute(
                """INSERT INTO reserva_participante (id_reserva, ci, asistencia)
                VALUES (%s, %s, FALSE)""",
                (id_reserva, ci_p)
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


    except HTTPException as http_err:
        if conn is not None:
            try:
                conn.rollback()
            except:
                pass
        raise http_err

    except Exception as error:
        if conn is not None:
            try:
                conn.rollback()
            except:
                pass

        print(f"Error al crear reserva: {error}")
        raise HTTPException(status_code=500, detail="Error en el servidor")

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass

        if conn is not None:
            try:
                conn.close()
            except:
                pass




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

        # Convertir CI a int
        try:
            ci_int = int(request.ci.strip())
        except:
            raise HTTPException(status_code=400, detail="CI inválido")

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT asistencia 
            FROM reserva_participante 
            WHERE id_reserva = %s AND ci = %s
            """,
            (request.id_reserva, ci_int)
        )
        row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail=f"Participante con CI {ci_int} no está registrado en la reserva"
            )
        

        if row["asistencia"] == 1 or row["asistencia"] is True:
            return {
                "success": True,
                "mensaje": f"Participante con CI {ci_int} ya tiene asistencia marcada"
            }

        cursor.execute(
            """
            UPDATE reserva_participante 
            SET asistencia = TRUE 
            WHERE id_reserva = %s AND ci = %s
            """,
            (request.id_reserva, ci_int)
        )

        conn.commit()

        return {
            "success": True,
            "mensaje": f"Asistencia marcada correctamente para el CI {ci_int}"
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


