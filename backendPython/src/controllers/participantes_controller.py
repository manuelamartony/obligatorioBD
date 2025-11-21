from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_todos_usuarios(rol: str = None, limit: int = 50, offset: int = 0):
    """Obtener todos los participantes (con paginación opcional)"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT DISTINCT p.ci, p.nombre, p.apellido, p.email
            FROM usuario p
            LEFT JOIN participante_carrera ppa ON p.ci = ppa.ci
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
        count_query = 'SELECT COUNT(DISTINCT p.ci) as total FROM usuario p'
        count_params = []
        if rol:
            count_query += ' INNER JOIN participante_carrera ppa ON p.ci = ppa.ci WHERE ppa.rol = %s'
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

async def obtener_usuario(ci:int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        
        query = """
            SELECT 
                u.ci,
                u.nombre,
                u.apellido,
                u.email,
                pc.nombre_carrera,
                pc.rol,
                c.tipo AS tipo_carrera
            FROM usuario u
            JOIN participante_carrera pc 
                ON u.ci = pc.ci
            JOIN carrera c
                ON pc.nombre_carrera = c.nombre_carrera
            WHERE u.ci = %s
        """
        cursor.execute(query,(ci,))
        resultados = cursor.fetchall()
        
        return {
            "success": True,
            "message": "Participante encontrado exitosamente",
           "participante":resultados
        }
        
    except Exception as error:
        print(f'Error al obtener participantes: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    
async def obtener_rol_usuario(ci:int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT pc.ci, pc.rol
        FROM participante_carrera pc
        WHERE ci = %s
        """
        cursor.execute(query, (ci,))
        resultados = cursor.fetchall()
        
        return {
            "success": True,
            "message": "Rol encontrado exitosamente",
            "participante": resultados
        }
        
    except Exception as error:
        print(f'Error al obtener participante: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

            
async def crear_usuario(ci:int,nombre:str,apellido:str,email:str):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        query="""INSERT INTO usuario (ci, nombre, apellido, email) VALUES(%s,%s,%s,%s)"""
        
        
        cursor.execute(query, (ci,nombre,apellido,email))
        conn.commit()
        return {
            "success": True,
            "message": "Usuario creado correctamente",
            "data": {
                "ci": ci,
                "nombre": nombre,
                "apellido":apellido,
                "email":email
            }
        }
    except  Exception as error:
        print(f'Error al crear participante: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
async def borrar_usuario(ci:int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        query="""DELETE FROM usuario
WHERE ci=%s"""
        
        
        cursor.execute(query, (ci,))
        conn.commit()
        return {
            "success": True,
            "message": "Usuario eliminado correctamente",
       
        }
    except  Exception as error:
        print(f'Error al crear participante: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
            
            
async def modificar_usuario(ci: int, nombre: str = None, apellido: str = None, email: str = None, nuevo_ci: int = None):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        campos = {}
        if nombre is not None:
            campos["nombre"] = nombre
        if apellido is not None:
            campos["apellido"] = apellido
        if email is not None:
            campos["email"] = email
        if nuevo_ci is not None:
            campos["ci"] = nuevo_ci   

        if not campos:
            return {"success": False, "message": "No se enviaron campos para actualizar."}


        set_clause = ", ".join([f"{campo} = %s" for campo in campos])
        valores = list(campos.values())
        valores.append(ci) 

        query = f"""
            UPDATE usuario
            SET {set_clause}
            WHERE ci = %s
        """

        cursor.execute(query, valores)
        conn.commit()

        return {
            "success": True,
            "message": "Usuario actualizado correctamente.",
            "data": campos
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
