from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_todos_usuarios(rol: str = None, limit: int = 50, offset: int = 0):
    """Obtener todos los participantes (con paginación opcional)"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT u.ci, u.nombre, u.apellido, u.email, u.esAdmin, u.activo, pc.rol, pc.nombre_carrera
            FROM usuario u
            LEFT JOIN participante_carrera pc ON u.ci = pc.ci
            WHERE u.activo = TRUE AND u.esAdmin = FALSE
        """
        params = []

        if rol:
            query += ' AND pc.rol = %s'
            params.append(rol)

        query += ' ORDER BY u.apellido, u.nombre LIMIT %s OFFSET %s'
        params.extend([limit, offset])

        cursor.execute(query, tuple(params))
        participantes = cursor.fetchall()

        # Contar total
        count_query = 'SELECT COUNT(DISTINCT u.ci) as total FROM usuario u'
        count_params = []
        if rol:
            count_query += ' INNER JOIN participante_carrera ppa ON p.ci = ppa.ci WHERE ppa.rol = %s'
            count_params.append(rol)

        cursor.execute(count_query, count_params)
        total_row = cursor.fetchone()
        total = total_row['total'] if total_row else 0

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
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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

            
async def crear_usuario(ci:int, nombre:str, apellido:str, email:str, contrasena: str = None, rol: str = None, nombre_carrera: str = None):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary = True)
        query="""INSERT INTO usuario (ci, nombre, apellido, email, esAdmin) VALUES(%s,%s,%s,%s,%s)"""
        
        
        cursor.execute(query, (ci,nombre,apellido,email, False))
        
        if contrasena:
            query_login = "INSERT INTO login (correo, contrasena) VALUES (%s, %s)"
            cursor.execute(query_login, (email, contrasena))
        
        if rol and nombre_carrera:
            cursor.execute("SELECT MAX(id_alumno_programa) as max_id FROM participante_carrera")
            row = cursor.fetchone()
            max_id = row['max_id'] if row and row['max_id'] else 0
            id_alumno_programa = max_id + 1
            
            query_participante = "INSERT INTO participante_carrera (id_alumno_programa, ci, nombre_carrera, rol) VALUES (%s, %s, %s, %s)"
            cursor.execute(query_participante, (id_alumno_programa, ci, nombre_carrera, rol))
            
        conn.commit()
        return {
            "success": True,
            "message": "Usuario creado correctamente",
            "data": {
                "ci": ci,
                "nombre": nombre,
                "apellido":apellido,
                "email":email,
                "hasLogin": bool(contrasena),
                "hasRole": bool(rol and nombre_carrera)
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
        
        # Check for dependencies (reservations or sanctions)
        cursor.execute("SELECT 1 FROM reserva_participante WHERE ci = %s LIMIT 1", (ci,))
        has_reservations = cursor.fetchone()
        
        cursor.execute("SELECT 1 FROM sancion_participante WHERE ci = %s LIMIT 1", (ci,))
        has_sanctions = cursor.fetchone()
        
        if has_reservations or has_sanctions:
            # Soft Delete
            cursor.execute("UPDATE usuario SET activo = FALSE WHERE ci = %s", (ci,))
            # Also soft delete login if exists (optional, but good practice to prevent login)
            # For now, we'll just keep the login active or maybe we should delete it?
            # Let's delete the login to prevent access
            cursor.execute("SELECT email FROM usuario WHERE ci = %s", (ci,))
            row = cursor.fetchone()
            if row:
                cursor.execute("DELETE FROM login WHERE correo = %s", (row['email'],))
                
            message = "Usuario desactivado correctamente (Soft Delete)"
        else:
            # Hard Delete (existing logic)
            # Get email first to delete from login
            cursor.execute("SELECT email FROM usuario WHERE ci = %s", (ci,))
            row = cursor.fetchone()
            
            if row:
                email = row['email']
                # Delete from login table if exists
                cursor.execute("DELETE FROM login WHERE correo = %s", (email,))
            
            # Delete from participante_carrera table
            cursor.execute("DELETE FROM participante_carrera WHERE ci = %s", (ci,))
            
            # Finally delete from usuario table
            cursor.execute("DELETE FROM usuario WHERE ci = %s", (ci,))
            message = "Usuario eliminado permanentemente"
        
        conn.commit()
        return {
            "success": True,
            "message": message,
        }
    except Exception as error:
        print(f'Error al borrar participante: {error}')
        if conn:
            conn.rollback()
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
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

async def obtener_carreras():
    """Obtener todas las carreras disponibles"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT nombre_carrera, tipo FROM carrera ORDER BY nombre_carrera"
        cursor.execute(query)
        carreras = cursor.fetchall()
        
        return {
            "success": True,
            "carreras": carreras
        }
    except Exception as error:
        print(f'Error al obtener carreras: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()