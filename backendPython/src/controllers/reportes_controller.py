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
async def cantidad_reservas_segun_dia ():
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