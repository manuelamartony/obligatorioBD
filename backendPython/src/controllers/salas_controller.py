from fastapi import HTTPException
from src.config.database import get_connection
from src.models.sala_models import TipoSala


async def obtener_salas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sala WHERE activo = TRUE")
        salas = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"success": True, "salas": salas}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}

async def obtener_edificios():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM edificio ORDER BY nombre_edificio")
        edificios = cursor.fetchall()
        return {"success": True, "edificios": edificios}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}
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
        
        query="""INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, activo) VALUES(
            %s,%s,%s,%s, TRUE)"""
            
        cursor.execute(query, (nombre_sala,edificio,capacidad,tipo_sala.value))
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

async def borrar_sala(nombre_sala: str, edificio: str, force: bool = False):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Check for reservations
        cursor.execute(
            "SELECT COUNT(*) as count FROM reserva WHERE nombre_sala = %s AND edificio = %s",
            (nombre_sala, edificio)
        )
        result = cursor.fetchone()
        count = result['count'] if result else 0

        if count > 0:
            if force:
                # If force is true, we delete everything (Hard Delete with cascade)
                cursor.execute(
                    "DELETE FROM reserva WHERE nombre_sala = %s AND edificio = %s",
                    (nombre_sala, edificio)
                )
                cursor.execute(
                    "DELETE FROM sala WHERE nombre_sala = %s AND edificio = %s",
                    (nombre_sala, edificio)
                )
                message = "Sala y sus reservas eliminadas correctamente"
            else:
                # Soft Delete
                cursor.execute(
                    "UPDATE sala SET activo = FALSE WHERE nombre_sala = %s AND edificio = %s",
                    (nombre_sala, edificio)
                )
                message = "Sala desactivada correctamente (Soft Delete)"
        else:
            # Hard Delete
            cursor.execute(
                "DELETE FROM sala WHERE nombre_sala = %s AND edificio = %s",
                (nombre_sala, edificio)
            )
            message = "Sala eliminada correctamente"

        conn.commit()
        return {"success": True, "message": message}

    except Exception as e:
        print(f"Error al borrar sala: {e}")
        raise HTTPException(status_code=500, detail=str(e))
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

        cursor.execute(query, (capacidad, tipo_sala.value, nombre_sala, edificio))
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
