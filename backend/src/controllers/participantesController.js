import { pool } from '../config/database.js';

// Obtener datos de un participante específico
export const obtenerParticipante = async (req, res) => {
  try {
    const { ci } = req.params;

    // Obtener datos del participante
    const [participanteRows] = await pool.query(
      'SELECT ci, nombre, apellido, email FROM participante WHERE ci = ?',
      [ci]
    );

    if (participanteRows.length === 0) {
      return res.status(404).json({
        error: 'Participante no encontrado'
      });
    }

    const participante = participanteRows[0];

    // Obtener programas académicos del participante
    const [programas] = await pool.query(
      `SELECT
        pa.nombre_programa,
        pa.tipo,
        pa.id_facultad,
        f.nombre_facultad
      FROM participante_programa_académico ppa
      INNER JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
      INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
      WHERE ppa.ci = ?`,
      [ci]
    );

    res.json({
      success: true,
      participante: {
        ...participante,
        programas
      }
    });

  } catch (error) {
    console.error('Error al obtener participante:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener sanciones de un participante
export const obtenerSanciones = async (req, res) => {
  try {
    const { ci } = req.params;

    const [sanciones] = await pool.query(
      `SELECT
        fecha_inicio,
        fecha_fin,
        CASE
          WHEN fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE() THEN TRUE
          ELSE FALSE
        END as activa,
        DATEDIFF(fecha_fin, fecha_inicio) as duracion_dias
      FROM sancion_participante
      WHERE ci = ?
      ORDER BY fecha_inicio DESC`,
      [ci]
    );

    res.json({
      success: true,
      ci: parseInt(ci),
      total_sanciones: sanciones.length,
      sanciones_activas: sanciones.filter(s => s.activa).length,
      sanciones
    });

  } catch (error) {
    console.error('Error al obtener sanciones:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Verificar si un participante tiene sanciones activas
export const verificarSancionesActivas = async (req, res) => {
  try {
    const { ci } = req.params;

    const [sanciones] = await pool.query(
      `SELECT
        fecha_inicio,
        fecha_fin
      FROM sancion_participante
      WHERE ci = ? AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()`,
      [ci]
    );

    res.json({
      success: true,
      ci: parseInt(ci),
      tiene_sanciones_activas: sanciones.length > 0,
      cantidad: sanciones.length,
      sanciones
    });

  } catch (error) {
    console.error('Error al verificar sanciones:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener todos los participantes (con paginación opcional)
export const obtenerTodosParticipantes = async (req, res) => {
  try {
    const { rol, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT DISTINCT p.ci, p.nombre, p.apellido, p.email
      FROM participante p
      LEFT JOIN participante_programa_académico ppa ON p.ci = ppa.ci
    `;
    const params = [];

    if (rol) {
      query += ' WHERE ppa.rol = ?';
      params.push(rol);
    }

    query += ' ORDER BY apellido, nombre LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [participantes] = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(DISTINCT p.ci) as total FROM participante p';
    if (rol) {
      countQuery += ' INNER JOIN participante_programa_académico ppa ON p.ci = ppa.ci WHERE ppa.rol = ?';
      const [countResult] = await pool.query(countQuery, [rol]);
      var total = countResult[0].total;
    } else {
      const [countResult] = await pool.query(countQuery);
      var total = countResult[0].total;
    }

    res.json({
      success: true,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      participantes
    });

  } catch (error) {
    console.error('Error al obtener participantes:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener historial de reservas de un participante
export const obtenerHistorialReservas = async (req, res) => {
  try {
    const { ci } = req.params;
    const { estado, fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT DISTINCT
        r.id_reserva,
        r.nombre_sala,
        r.edificio,
        r.fecha,
        r.estado,
        rp.fecha_solicitud_reserva as fecha_solicitud,
        t.hora_inicio,
        t.hora_fin,
        CASE 
          WHEN rp.ci = ? AND rp.fecha_solicitud_reserva IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as es_organizador
      FROM reserva r
      INNER JOIN turno t ON r.id_turno = t.id_turno
      INNER JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
      WHERE rp.ci = ?
    `;

    const params = [ci, ci];

    if (estado) {
      query += ' AND r.estado = ?';
      params.push(estado);
    }

    if (fecha_inicio && fecha_fin) {
      query += ' AND r.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY r.fecha DESC, t.hora_inicio DESC';

    const [reservas] = await pool.query(query, params);

    res.json({
      success: true,
      ci: parseInt(ci),
      total_reservas: reservas.length,
      reservas
    });

  } catch (error) {
    console.error('Error al obtener historial de reservas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
