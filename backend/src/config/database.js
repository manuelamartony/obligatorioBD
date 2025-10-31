import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'obligatorioBD',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' Conexión a MySQL exitosa');
    connection.release();
  } catch (error) {
    console.error(' Error al conectar a MySQL:', error.message);
    process.exit(1);
  }
};

export { pool, testConnection };
