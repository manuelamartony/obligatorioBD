from fastapi import HTTPException
from src.config.database import get_connection

async def obtener_facultades():
    """Obtener todas las facultades"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT id_facultad, nombre_facultad FROM facultad ORDER BY nombre_facultad'
        )
        facultades = cursor.fetchall()

        return {
            "success": True,
            "facultades": facultades
        }

    except Exception as error:
        print(f'Error al obtener facultades: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def obtener_programas(id_facultad: int = None, tipo: str = None):
    """Obtener programas académicos (con filtros opcionales)"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                pa.nombre_programa,
                pa.id_facultad,
                pa.tipo,
                f.nombre_facultad
            FROM programa_academico pa
            INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
            WHERE 1=1
        """

        params = []

        if id_facultad:
            query += ' AND pa.id_facultad = %s'
            params.append(id_facultad)

        if tipo:
            query += ' AND pa.tipo = %s'
            params.append(tipo)

        query += ' ORDER BY f.nombre_facultad, pa.nombre_programa'

        cursor.execute(query, params)
        programas = cursor.fetchall()

        return {
            "success": True,
            "programas": programas
        }

    except Exception as error:
        print(f'Error al obtener programas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def obtener_programas_por_facultad(id_facultad: int):
    """Obtener programas de una facultad específica"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """SELECT
                pa.nombre_programa,
                pa.id_facultad,
                pa.tipo,
                f.nombre_facultad
            FROM programa_academico pa
            INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
            WHERE pa.id_facultad = %s
            ORDER BY pa.nombre_programa""",
            (id_facultad,)
        )
        programas = cursor.fetchall()

        return {
            "success": True,
            "id_facultad": id_facultad,
            "programas": programas
        }

    except Exception as error:
        print(f'Error al obtener programas de facultad: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


async def obtener_tipos_programas():
    """Obtener tipos de programas disponibles"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT DISTINCT tipo FROM programa_academico ORDER BY tipo'
        )
        tipos_rows = cursor.fetchall()

        tipos = [t['tipo'] for t in tipos_rows]

        return {
            "success": True,
            "tipos": tipos
        }

    except Exception as error:
        print(f'Error al obtener tipos de programas: {error}')
        raise HTTPException(
            status_code=500,
            detail="Error en el servidor"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

