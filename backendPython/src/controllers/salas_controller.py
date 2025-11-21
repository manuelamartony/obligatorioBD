from fastapi import HTTPException
from src.config.database import get_connection
from src.models.sala_models import TipoSala


async def obtener_todas_las_salas():
    cursor = None
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query="""SELECT * FROM sala"""
        
        cursor.execute(query)
        resultados = cursor.fetchall()
        

        return {
            "success": True,
            "salas": resultados
        }
        
        
    except Exception as error:
        print(f'Error en todas las salas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
            
            
async def obtener_disponibilidad_sala(sala:str,turno:str,fecha:str):
    cursor = None
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query="""SELECT * FROM reserva
        WHERE nombre_sala= %s AND id_turno = %s AND fecha= %s"""
        
        cursor.execute(query, (sala,turno, fecha))
        resultado = cursor.fetchone()

        estado = "ocupada" if resultado else "disponible"

        
        return {
            "success": True,
            "estado": estado
        }
        
        
    except Exception as error:
        
        print(f'Error en la disponibilidad de las salas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    
            
async def crear_sala(nombre_sala:str,edificio:str,capacidad:int,tipo_sala:TipoSala):
    cursor = None
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query="""INSERT INTO sala VALUES(
            %s,%s,%s,%s)"""
            
        cursor.execute(query, (nombre_sala,edificio,capacidad,tipo_sala))
        conn.commit()
        return {
            "success": True,
            "message": "Sala creada correctamente",
            "data": {
              "nombre_sala":nombre_sala,
              "edificio":edificio,
              "capacidad":capacidad,
              "tipo_sala":tipo_sala
            }
        }
        
    except Exception as error:
        
        print(f'Error en crear la sala: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def borrar_sala(nombre_sala:str,edificio:str):
    cursor = None
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query = """DELETE FROM sala WHERE nombre_sala=%s AND edificio=%s"""
        cursor.execute(query, (nombre_sala,edificio))
        conn.commit()
        return {
            "success": True,
            "message": "Sala eliminada correctamente"}
        
    except Exception as error:
        
        print(f'Error al borrar la sala: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def modificar_sala(nombre_sala: str, edificio: str, capacidad: int, tipo_sala: TipoSala):
    cursor = None
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            UPDATE sala
            SET capacidad = %s,
                tipo_sala = %s
            WHERE nombre_sala = %s AND edificio = %s
        """

        cursor.execute(query, (capacidad, tipo_sala, nombre_sala, edificio))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="La sala no existe"
            )

        return {
            "success": True,
            "message": "Sala modificada correctamente",
            "data": {
                "nombre_sala": nombre_sala,
                "edificio": edificio,
                "capacidad": capacidad,
                "tipo_sala": tipo_sala
            }
        }
    except Exception as error:
        print(f'Error al modificar la sala: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
