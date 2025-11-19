from fastapi import HTTPException
from src.config.database import get_connection

async def todas_las_sanciones():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query= "SELECT * FROM sancion_participante"
        cursor.execute(query)
        resultados = cursor.fetchall()
        

        return {
            "success": True,
            "sanciones": resultados
        }
        
    except Exception as error:
        print(f'Error en las sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
    
async def sancion_por_usuario(ci:int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query= """SELECT * FROM sancion_participante 
        WHERE ci = %s"""
        
        cursor.execute(query, (ci))
        resultados = cursor.fetchall()
        return {
            "success": True,
            "sanciones": resultados
        }

        
    except Exception as error:
        print(f'Error en las sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
        
async def crear_sancion_a_usuario(ci:int,fecha_inicio:str,fecha_fin:str):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
    
        query = """INSERT INTO sancion_participante VALUES(
                    %s,%s,%s)"""
        
        cursor.execute(query, (ci,fecha_inicio,fecha_fin))
        conn.commit()
        return {
            "success": True,
            "message": "Sanción creada correctamente",
            "data": {
                "ci": ci,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
        }
        
    except Exception as error:
        print(f'Error en las sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
        
async def quitar_sancion_a_usuario(ci:int,fecha_inicio:str,fecha_fin:str):
    try:
       conn = get_connection()
       cursor = conn.cursor(dictionary = True)
    
       query = """DELETE FROM sancion_participante
       WHERE ci = %s AND fecha_inicio = %s AND fecha_fin = %s"""
       
       cursor.execute(query, (ci,fecha_inicio,fecha_fin))
       conn.commit()
       return {
            "success": True,
            "message": "Sanción eliminada correctamente"}
        
        
    except Exception as error:
        print(f'Error en las sanciones: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            

async def modificar_tiempo_sancion(ci:int,fecha_inicio:str,fecha_fin:str):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query = """UPDATE sancion_participante SET fecha_fin = %s
        WHERE ci = %s AND fecha_inicio = %s"""
        cursor.execute(query, (ci,fecha_inicio,fecha_fin))
        conn.commit()
        return {
            "success": True,
            "message": "Duración de la sanción actualizada correctamente.",
            "data": {
                "ci": ci,
                "fecha_inicio": fecha_inicio,
                "nueva_fecha_fin": fecha_fin
            }}
        
        
        
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
            