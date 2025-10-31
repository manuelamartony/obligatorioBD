import { pool } from '../config/database.js';

// Obtener todas las salas (con filtro opcional por tipo)
export const obtenerSalas = async (req, res) => {
  try {
    const { tipo_sala } = req.query;

    let query = `
      SELECT
        s.nombre_sala,
        s.edificio,
        s.capacidad,
        s.tipo_sala,
        e.nombre_edificio,
        e.direccion
      FROM sala s
      INNER JOIN edificio e ON s.edificio = e.nombre_edificio
    `;

    const params = [];

    if (tipo_sala) {
      query += ' WHERE s.tipo_sala = ?';
      params.push(tipo_sala);
    }

    query += ' ORDER BY s.edificio, s.nombre_sala';

    const [salas] = await pool.query(query, params);

    res.json({
      success: true,
      salas
    });

  } catch (error) {
    console.error('Error al obtener salas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener disponibilidad de una sala específica en una fecha
export const obtenerDisponibilidadSala = async (req, res) => {
  try {
    const { nombre } = req.params;
    const { fecha, edificio } = req.query;

    if (!fecha || !edificio) {
      return res.status(400).json({
        error: 'Fecha y edificio son requeridos'
      });
    }

    // Verificar que la sala exista
    const [salaRows] = await pool.query(
      'SELECT * FROM sala WHERE nombre_sala = ? AND edificio = ?',
      [nombre, edificio]
    );

    if (salaRows.length === 0) {
      return res.status(404).json({
        error: 'Sala no encontrada'
      });
    }

    // Obtener todos los turnos
    const [turnos] = await pool.query(
      'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
    );

    // Obtener reservas existentes para esa sala y fecha
    const [reservas] = await pool.query(
      `SELECT id_turno FROM reserva
       WHERE nombre_sala = ? AND edificio = ? AND fecha = ?
       AND estado IN ('activa', 'finalizada')`,
      [nombre, edificio, fecha]
    );

    const turnosReservados = new Set(reservas.map(r => r.id_turno));

    // Marcar turnos como disponibles o no
    const turnosConDisponibilidad = turnos.map(turno => ({
      id_turno: turno.id_turno,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      disponible: !turnosReservados.has(turno.id_turno)
    }));

    res.json({
      success: true,
      sala: nombre,
      edificio,
      fecha,
      turnos: turnosConDisponibilidad
    });

  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener todos los edificios
export const obtenerEdificios = async (req, res) => {
  try {
    const [edificios] = await pool.query(
      'SELECT nombre_edificio, direccion FROM edificio ORDER BY nombre_edificio'
    );

    res.json({
      success: true,
      edificios
    });

  } catch (error) {
    console.error('Error al obtener edificios:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener salas de un edificio específico
export const obtenerSalasPorEdificio = async (req, res) => {
  try {
    const { edificio } = req.params;

    const [salas] = await pool.query(
      `SELECT
        nombre_sala,
        edificio,
        capacidad,
        tipo_sala
      FROM sala
      WHERE edificio = ?
      ORDER BY nombre_sala`,
      [edificio]
    );

    res.json({
      success: true,
      edificio,
      salas
    });

  } catch (error) {
    console.error('Error al obtener salas del edificio:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
