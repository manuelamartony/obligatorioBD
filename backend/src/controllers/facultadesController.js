import { pool } from '../config/database.js';

// Obtener todas las facultades
export const obtenerFacultades = async (req, res) => {
  try {
    const [facultades] = await pool.query(
      'SELECT id_facultad, nombre_facultad FROM facultad ORDER BY nombre_facultad'
    );

    res.json({
      success: true,
      facultades
    });

  } catch (error) {
    console.error('Error al obtener facultades:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener programas académicos (con filtros opcionales)
export const obtenerProgramas = async (req, res) => {
  try {
    const { id_facultad, tipo } = req.query;

    let query = `
      SELECT
        pa.nombre_programa,
        pa.id_facultad,
        pa.tipo,
        f.nombre_facultad
      FROM programa_academico pa
      INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
      WHERE 1=1
    `;

    const params = [];

    if (id_facultad) {
      query += ' AND pa.id_facultad = ?';
      params.push(id_facultad);
    }

    if (tipo) {
      query += ' AND pa.tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY f.nombre_facultad, pa.nombre_programa';

    const [programas] = await pool.query(query, params);

    res.json({
      success: true,
      programas
    });

  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener programas de una facultad específica
export const obtenerProgramasPorFacultad = async (req, res) => {
  try {
    const { id_facultad } = req.params;

    const [programas] = await pool.query(
      `SELECT
        pa.nombre_programa,
        pa.id_facultad,
        pa.tipo,
        f.nombre_facultad
      FROM programa_academico pa
      INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
      WHERE pa.id_facultad = ?
      ORDER BY pa.nombre_programa`,
      [id_facultad]
    );

    res.json({
      success: true,
      id_facultad: parseInt(id_facultad),
      programas
    });

  } catch (error) {
    console.error('Error al obtener programas de facultad:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener tipos de programas disponibles
export const obtenerTiposProgramas = async (req, res) => {
  try {
    const [tipos] = await pool.query(
      'SELECT DISTINCT tipo FROM programa_academico ORDER BY tipo'
    );

    res.json({
      success: true,
      tipos: tipos.map(t => t.tipo)
    });

  } catch (error) {
    console.error('Error al obtener tipos de programas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
