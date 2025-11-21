from fastapi import HTTPException
from src.config.database import get_connection

#Reservas de salas mas usadas (top 5 salas mas reservadas)
async def salas_mas_reservadas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query  = """SELECT reserva.nombre_sala , COUNT(reserva.nombre_sala) AS cant 
        FROM reserva
        GROUP BY nombre_sala
        ORDER BY cant DESC
        LIMIT 5"""

        cursor.execute(query)
        resultados = cursor.fetchall()


        return {
            "success": True,
            "salas": resultados
        }
    except Exception as error:
        print(f'Error en salas más reservadas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
#Consultas para los turnos mas demandadas
async def turnos_mas_demandados():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query  = """SELECT turno.hora_inicio,turno.hora_fin,COUNT(id_reserva) AS cant FROM turno
        JOIN obligatorio_bd.reserva r ON turno.id_turno = r.id_turno
        GROUP BY turno.hora_inicio, turno.hora_fin
        ORDER BY cant DESC ;"""
        
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "turnos": resultados}
    except  Exception as error:
        print(f'Error en turnos mas demandados: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
#Cantidad promedio de participantes por salas
async def promedios_participantes_por_salas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query = """SELECT reserva.nombre_sala,AVG(participante) as promedio_participantes FROM (
            SELECT reserva_participante.id_reserva,COUNT(reserva_participante.ci) AS participante
            FROM reserva_participante
            GROUP BY reserva_participante.id_reserva) as cuenta
            JOIN reserva ON reserva.id_reserva = cuenta.id_reserva
            GROUP BY reserva.nombre_sala """
            
            
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "promedio_participantes": resultados}
    except Exception as error:
        print(f'Error en promedio de participantes por sala: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
#Cantidad de sanciones segun la carrera ---Consulta inventada por nosotros(ultimo pto en consultas)
async def sanciones_segun_carrera():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        query = """SELECT c.nombre_carrera,COUNT(*) AS cant
        FROM sancion_participante sp
        JOIN participante_carrera p ON p.ci = sp.ci
        JOIN carrera c ON p.nombre_carrera = c.nombre_carrera
        GROUP BY c.nombre_carrera
        ORDER BY cant DESC """
        
        
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "sanciones": resultados}
    except Exception as error:
        print(f'Error en sanciones segun carrera: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
#Cantidad de reservas segun dia de la semana (solo muestra los dias con resevas) -- Consulta inventada por nosotros (ultimo pto en consultas)
async def cantidad_reservas_segun_dia():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        query="""SELECT
        DAYNAME(r.fecha) AS dia,
        COUNT(*) AS cant
        FROM reserva r
        GROUP BY DAYOFWEEK(r.fecha), DAYNAME(r.fecha)
        ORDER BY DAYOFWEEK(r.fecha)"""
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "reservas_por_dia": resultados}
        
    except  Exception as error:
        print(f'Error en reservas segun dia: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def ocupacion_salas_por_edificio():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """SELECT
                    s.edificio,
                    COUNT(t.id_turno) AS total_turnos_posibles,
                    COUNT(r.id_reserva) AS turnos_ocupados,
                    ROUND(
                        (COUNT(r.id_reserva) * 100.0) / COUNT(t.id_turno),
                        2
                    ) AS porcentaje_ocupacion
                FROM sala s
                CROSS JOIN turno t
                LEFT JOIN reserva r
                    ON r.nombre_sala = s.nombre_sala
                    AND r.id_turno = t.id_turno
                    AND r.estado = 'activa'
                GROUP BY s.edificio
                ORDER BY porcentaje_ocupacion DESC"""
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "ocupacion_salas_por_edificio": resultados}
    
    except Exception as error:
        print(f'Error en ocupacion de salas por edificio: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def cantidad_reservas_asistencias_profesores_alumnos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """SELECT
                    s.edificio,
                    COUNT(t.id_turno) AS total_turnos_posibles,
                    COUNT(r.id_reserva) AS turnos_ocupados,
                    ROUND(
                        (COUNT(r.id_reserva) * 100.0) / COUNT(t.id_turno),
                        2
                    ) AS porcentaje_ocupacion
                FROM sala s
                CROSS JOIN turno t
                LEFT JOIN reserva r
                    ON r.nombre_sala = s.nombre_sala
                    AND r.id_turno = t.id_turno
                    AND r.estado = 'activa'
                GROUP BY s.edificio
                ORDER BY porcentaje_ocupacion DESC"""
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "cantidad_reservas_asistencias_profesores_alumnos": resultados}
    
    except Exception as error:
        print(f'Error en cantidad de reservas y asistencias por profesores y alumnos: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def cantidad_reservas_asistencias_profesores_alumnos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """SELECT
                    u.ci,
                    u.nombre,
                    u.apellido,
                    pc.rol,
                    COUNT(rp.id_reserva) AS total_reservas,
                    SUM(rp.asistencia) AS total_asistencias
                FROM usuario u
                JOIN participante_carrera pc
                    ON u.ci = pc.ci
                LEFT JOIN reserva_participante rp
                    ON u.ci = rp.ci
                JOIN carrera c
                    ON pc.nombre_carrera = c.nombre_carrera
                GROUP BY
                    u.ci, u.nombre, u.apellido, pc.rol
                ORDER BY
                    pc.rol, total_reservas DESC
                """
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "cantidad_reservas_asistencias_profesores_alumnos": resultados}
    
    except Exception as error:
        print(f'Error en cantidad de reservas y asistencias por profesores y alumnos: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def cantidad_sanciones_profesores_alumnos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT
    u.ci,
    u.nombre,
    u.apellido,
    pc.rol,
    COUNT(sp.ci) AS total_sanciones
FROM usuario u
JOIN participante_carrera pc
    ON u.ci = pc.ci
JOIN carrera c
    ON pc.nombre_carrera = c.nombre_carrera
LEFT JOIN sancion_participante sp
    ON u.ci = sp.ci
GROUP BY
    u.ci, u.nombre, u.apellido, pc.rol
ORDER BY
    pc.rol, total_sanciones DESC
        """
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "cantidad_sanciones_profesores_alumnos": resultados}
    
    except Exception as error:
        print(f'Error en cantidad de sanciones para profesores y alumnos: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def reservas_utilizadas_vs_canceladas_noAsistidas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """SELECT
                    ROUND(
                        COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) * 100.0
                        / COUNT(*)
                    , 2) AS porcentaje_utilizadas,

                    ROUND(
                        COUNT(CASE WHEN estado IN ('cancelada', 'sin asistencia') THEN 1 END) * 100.0
                        / COUNT(*)
                    , 2) AS porcentaje_no_utilizadas

                FROM reserva"""
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "reservas_utilizadas_vs_canceladas_noAsistidas": resultados}
    
    except Exception as error:
        print(f'Error en porcentaje de reservas utilizadas vs canceladas/no asistidas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def tasa_cancelacion_por_participante():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """SELECT
                    u.nombre,
                    u.apellido,
                    COUNT(rp.id_reserva) AS total_reservas,
                    SUM(CASE WHEN r.estado = 'cancelada' THEN 1 ELSE 0 END) AS reservas_canceladas,
                    ROUND(
                        CAST(SUM(CASE WHEN r.estado = 'cancelada' THEN 1 ELSE 0 END) AS DECIMAL(10,3))
                        / NULLIF(COUNT(rp.id_reserva), 0),
                        3
                    ) AS tasa_cancelacion
                FROM usuario u
                LEFT JOIN reserva_participante rp
                    ON u.ci = rp.ci
                LEFT JOIN reserva r
                    ON r.id_reserva = rp.id_reserva
                GROUP BY u.ci, u.nombre, u.apellido
                ORDER BY
                    tasa_cancelacion IS NULL,
                    tasa_cancelacion DESC"""
        cursor.execute(query)
        resultados = cursor.fetchall()
        return {"success": True, "tasa_cancelacion_por_participante": resultados}
    
    except Exception as error:
        print(f'Error en tasa de cancelacion por participante: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()