import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración del pool de conexiones
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'obligatorio_bd'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'autocommit': False
}

# Crear pool de conexiones
pool = pooling.MySQLConnectionPool(
    pool_name="obligatorio_pool",
    pool_size=10,
    pool_reset_session=True,
    **db_config
)

def get_connection():
    """Obtiene una conexión del pool"""
    return pool.get_connection()

def test_connection():
    """Prueba la conexión a la base de datos"""
    try:
        conn = get_connection()
        conn.close()
        print("✅ Conexión a MySQL exitosa")
        return True
    except Exception as error:
        print(f"❌ Error al conectar a MySQL: {error}")
        raise error

