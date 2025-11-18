from fastapi import HTTPException
from src.config.database import get_connection


async def reservas_por_facultad(fecha_inicio: str, fecha_fin: str):
    """Reservas por facultad"""
    try:
        if not fecha_inicio or not fecha_fin:
            raise HTTPException(
                status_code=400,
                detail="fecha_inicio y fecha_fin son requeridas"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                f.nombre_facultad,
                COUNT(DISTINCT r.id_reserva) as cantidad_reservas,
                COUNT(DISTINCT p.ci) as participantes_unicos
            FROM reserva r
            INNER JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            INNER JOIN participante p ON rp.ci = p.ci
            INNER JOIN participante_programa_académico ppa ON p.ci = ppa.ci
            INNER JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
            INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
            WHERE r.fecha BETWEEN %s AND %s
            GROUP BY f.id_facultad, f.nombre_facultad
            ORDER BY cantidad_reservas DESC
        """

        cursor.execute(query, (fecha_inicio, fecha_fin))
        resultados = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "periodo": {"fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin},
            "facultades": resultados
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en reporte de reservas por facultad: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def ocupacion_edificios(fecha: str):
    """Ocupación de salas por edificio"""
    try:
        if not fecha:
            raise HTTPException(
                status_code=400,
                detail="fecha es requerida"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                e.nombre_edificio,
                e.direccion,
                COUNT(DISTINCT s.nombre_sala) as total_salas,
                COUNT(DISTINCT r.nombre_sala) as salas_utilizadas,
                ROUND((COUNT(DISTINCT r.nombre_sala) / COUNT(DISTINCT s.nombre_sala)) * 100, 2) as ocupacion_porcentaje,
                COUNT(r.id_reserva) as total_reservas
            FROM edificio e
            INNER JOIN sala s ON e.nombre_edificio = s.edificio
            LEFT JOIN reserva r ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
                AND r.fecha = %s AND r.estado IN ('activa', 'finalizada')
            GROUP BY e.nombre_edificio, e.direccion
            ORDER BY ocupacion_porcentaje DESC
        """

        cursor.execute(query, (fecha,))
        resultados = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "fecha": fecha,
            "edificios": resultados
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en reporte de ocupación de edificios: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def cantidad_reservas(fecha_inicio: str, fecha_fin: str, estado: str = None):
    """Cantidad total de reservas con desglose por estado"""
    try:
        if not fecha_inicio or not fecha_fin:
            raise HTTPException(
                status_code=400,
                detail="fecha_inicio y fecha_fin son requeridas"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Consulta principal: total por estado
        query_por_estado = """
            SELECT
                estado,
                COUNT(*) as cantidad
            FROM reserva
            WHERE fecha BETWEEN %s AND %s
        """
        params = [fecha_inicio, fecha_fin]

        if estado:
            query_por_estado += ' AND estado = %s'
            params.append(estado)

        query_por_estado += ' GROUP BY estado'

        cursor.execute(query_por_estado, params)
        por_estado = cursor.fetchall()

        # Consulta de totales
        query_total = """
            SELECT
                COUNT(*) as total_reservas,
                COUNT(DISTINCT rp.ci) as usuarios_unicos,
                COUNT(DISTINCT DATE(r.fecha)) as dias_con_reservas
            FROM reserva r
            LEFT JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.fecha BETWEEN %s AND %s
        """
        
        if estado:
            query_total += ' AND r.estado = %s'

        cursor.execute(query_total, params)
        totales = cursor.fetchone()

        cursor.close()
        conn.close()

        # Formatear respuesta
        desglose_por_estado = {
            "activa": 0,
            "cancelada": 0,
            "sin_asistencia": 0,
            "finalizada": 0
        }

        for item in por_estado:
            estado_key = item['estado']
            if estado_key in desglose_por_estado:
                desglose_por_estado[estado_key] = item['cantidad']

        return {
            "success": True,
            "periodo": {"fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin},
            "filtro_estado": estado or "todos",
            "total_reservas": totales['total_reservas'],
            "usuarios_unicos": totales['usuarios_unicos'],
            "dias_con_reservas": totales['dias_con_reservas'],
            "por_estado": desglose_por_estado
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en reporte de cantidad de reservas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )


async def reporte_general(fecha_inicio: str, fecha_fin: str):
    """Reporte general del sistema"""
    try:
        if not fecha_inicio or not fecha_fin:
            raise HTTPException(
                status_code=400,
                detail="fecha_inicio y fecha_fin son requeridas"
            )

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener múltiples métricas
        cursor.execute(
            'SELECT COUNT(*) as total FROM reserva WHERE fecha BETWEEN %s AND %s',
            (fecha_inicio, fecha_fin)
        )
        total_reservas_row = cursor.fetchone()
        total_reservas = total_reservas_row['total'] if total_reservas_row else 0

        cursor.execute('SELECT COUNT(*) as total FROM sala')
        total_salas_row = cursor.fetchone()
        total_salas = total_salas_row['total'] if total_salas_row else 0

        cursor.execute('SELECT COUNT(*) as total FROM edificio')
        total_edificios_row = cursor.fetchone()
        total_edificios = total_edificios_row['total'] if total_edificios_row else 0

        cursor.execute('SELECT COUNT(DISTINCT ci) as total FROM participante')
        total_participantes_row = cursor.fetchone()
        total_participantes = total_participantes_row['total'] if total_participantes_row else 0

        cursor.execute(
            'SELECT estado, COUNT(*) as cantidad FROM reserva WHERE fecha BETWEEN %s AND %s GROUP BY estado',
            (fecha_inicio, fecha_fin)
        )
        reservas_por_estado = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "periodo": {"fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin},
            "metricas_generales": {
                "total_reservas": total_reservas,
                "total_salas": total_salas,
                "total_edificios": total_edificios,
                "total_participantes": total_participantes
            },
            "reservas_por_estado": reservas_por_estado
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f'Error en reporte general: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

