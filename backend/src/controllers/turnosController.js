import { pool } from '../config/database.js';

// Obtener todos los turnos disponibles
export const obtenerTurnos = async (req, res) => {
  try {
    const [turnos] = await pool.query(
      'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
    );

    res.json({
      success: true,
      turnos
    });

  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Verificar disponibilidad de un turno específico
export const verificarDisponibilidadTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, sala, edificio } = req.query;

    if (!fecha) {
      return res.status(400).json({
        error: 'Fecha es requerida'
      });
    }

    // Verificar que el turno exista
    const [turnoRows] = await pool.query(
      'SELECT * FROM turno WHERE id_turno = ?',
      [id]
    );

    if (turnoRows.length === 0) {
      return res.status(404).json({
        error: 'Turno no encontrado'
      });
    }

    const turno = turnoRows[0];

    // Si se especifica sala, verificar solo esa sala
    if (sala && edificio) {
      const [reservas] = await pool.query(
        `SELECT id_reserva FROM reserva
         WHERE nombre_sala = ? AND edificio = ? AND fecha = ? AND id_turno = ?
         AND estado IN ('activa', 'finalizada')`,
        [sala, edificio, fecha, id]
      );

      return res.json({
        success: true,
        id_turno: turno.id_turno,
        hora_inicio: turno.hora_inicio,
        hora_fin: turno.hora_fin,
        fecha,
        sala,
        edificio,
        disponible: reservas.length === 0
      });
    }

    // Si no se especifica sala, obtener todas las salas disponibles
    const [todasSalas] = await pool.query(
      'SELECT nombre_sala, edificio FROM sala ORDER BY edificio, nombre_sala'
    );

    const [reservas] = await pool.query(
      `SELECT nombre_sala, edificio FROM reserva
       WHERE fecha = ? AND id_turno = ?
       AND estado IN ('activa', 'finalizada')`,
      [fecha, id]
    );

    const salasReservadas = new Set(
      reservas.map(r => `${r.nombre_sala}|${r.edificio}`)
    );

    const salasDisponibles = todasSalas.filter(
      s => !salasReservadas.has(`${s.nombre_sala}|${s.edificio}`)
    );

    res.json({
      success: true,
      id_turno: turno.id_turno,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      fecha,
      disponible: salasDisponibles.length > 0,
      total_salas: todasSalas.length,
      salas_disponibles: salasDisponibles
    });

  } catch (error) {
    console.error('Error al verificar disponibilidad del turno:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener turnos disponibles para una fecha y sala específica
export const obtenerTurnosDisponibles = async (req, res) => {
  try {
    const { fecha, sala, edificio } = req.query;

    if (!fecha || !sala || !edificio) {
      return res.status(400).json({
        error: 'Fecha, sala y edificio son requeridos'
      });
    }

    // Obtener todos los turnos
    const [turnos] = await pool.query(
      'SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio'
    );

    // Obtener reservas existentes
    const [reservas] = await pool.query(
      `SELECT id_turno FROM reserva
       WHERE nombre_sala = ? AND edificio = ? AND fecha = ?
       AND estado IN ('activa', 'finalizada')`,
      [sala, edificio, fecha]
    );

    const turnosReservados = new Set(reservas.map(r => r.id_turno));

    const turnosDisponibles = turnos.filter(
      t => !turnosReservados.has(t.id_turno)
    );

    res.json({
      success: true,
      fecha,
      sala,
      edificio,
      turnos_disponibles: turnosDisponibles,
      total_turnos: turnos.length,
      turnos_ocupados: turnosReservados.size
    });

  } catch (error) {
    console.error('Error al obtener turnos disponibles:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
