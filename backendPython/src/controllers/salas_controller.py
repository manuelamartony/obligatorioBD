from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_todas_las_salas():
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