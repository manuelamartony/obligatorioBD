import { pool } from '../config/database.js';

// Obtener todas las reservas de un usuario
export const obtenerReservas = async (req, res) => {
  try {
    const { ci } = req.query;

    if (!ci) {
      return res.status(400).json({
        error: 'CI del participante es requerido'
      });
    }

    const query = `
      SELECT
        r.id_reserva,
        r.nombre_sala,
        r.edificio,
        r.fecha,
        r.id_turno,
        r.estado,
        COUNT(rp.ci) as participantes
      FROM reserva r
      LEFT JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
      WHERE rp.ci = ?
      GROUP BY r.id_reserva, r.nombre_sala, r.edificio, r.fecha, r.id_turno, r.estado
      ORDER BY r.fecha DESC
    `;

    const [reservas] = await pool.query(query, [ci]);

    res.json({
      success: true,
      reservas
    });

  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Obtener detalle de una reserva específica
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos de la reserva
    const [reservaRows] = await pool.query(
      `SELECT
        r.id_reserva,
        r.nombre_sala,
        r.edificio,
        r.fecha,
        r.id_turno,
        r.estado,
        t.hora_inicio,
        t.hora_fin,
        s.capacidad,
        s.tipo_sala
      FROM reserva r
      INNER JOIN turno t ON r.id_turno = t.id_turno
      INNER JOIN sala s ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
      WHERE r.id_reserva = ?`,
      [id]
    );

    if (reservaRows.length === 0) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    const reserva = reservaRows[0];

    // Obtener participantes
    const [participantes] = await pool.query(
      `SELECT
        p.ci,
        p.nombre,
        p.apellido,
        p.email,
        rp.asistencia
      FROM reserva_participante rp
      INNER JOIN participante p ON rp.ci = p.ci
      WHERE rp.id_reserva = ?`,
      [id]
    );

    res.json({
      success: true,
      reserva: {
        ...reserva,
        participantes
      }
    });

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Crear nueva reserva
export const crearReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { nombre_sala, edificio, fecha, id_turno, ci, participantes } = req.body;

    // Validaciones
    if (!nombre_sala || !edificio || !fecha || !id_turno || !ci) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Todos los campos son requeridos'
      });
    }

    // Normalizar fecha a DATE (YYYY-MM-DD)
    const fechaDate = typeof fecha === 'string' ? fecha.split('T')[0] : fecha;

    // Verificar disponibilidad de la sala en ese turno y fecha
    const [existentes] = await connection.query(
      `SELECT id_reserva FROM reserva
       WHERE nombre_sala = ? AND edificio = ? AND fecha = ? AND id_turno = ?
       AND estado IN ('activa', 'finalizada')`,
      [nombre_sala, edificio, fechaDate, id_turno]
    );

    if (existentes.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'La sala ya está reservada para ese turno'
      });
    }

    // Verificar si el participante tiene sanciones activas
    const [sanciones] = await connection.query(
      `SELECT * FROM sancion_participante
       WHERE ci = ? AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()`,
      [ci]
    );

    if (sanciones.length > 0) {
      await connection.rollback();
      return res.status(403).json({
        error: 'No puedes realizar reservas debido a sanciones activas'
      });
    }

    // Generar nuevo id_reserva manualmente (sin AUTO_INCREMENT en SQL)
    const [[{ maxId }]] = await connection.query(
      'SELECT COALESCE(MAX(id_reserva), 0) AS maxId FROM reserva'
    );
    const id_reserva = (maxId || 0) + 1;

    // Crear la reserva (sin columnas inexistentes en SQL)
    await connection.query(
      `INSERT INTO reserva (id_reserva, nombre_sala, edificio, fecha, id_turno, estado)
       VALUES (?, ?, ?, ?, ?, 'activa')`,
      [id_reserva, nombre_sala, edificio, fechaDate, id_turno]
    );

    // Agregar participantes adicionales si existen
    if (participantes && Array.isArray(participantes)) {
      for (const participanteCi of participantes) {
        await connection.query(
          `INSERT INTO reserva_participante (id_reserva, ci, asistencia)
           VALUES (?, ?, FALSE)`,
          [id_reserva, participanteCi]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      id_reserva,
      estado: 'activa',
      mensaje: 'Reserva creada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear reserva:', error);
    // Errores comunes por FK/PK
    if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'Sala o edificio no existen o no coinciden'
      });
    }
    if (error && (error.errno === 1364 || error.code === 'ER_BAD_NULL_ERROR')) {
      return res.status(400).json({
        error: 'Falta un valor requerido para crear la reserva'
      });
    }
    res.status(500).json({
      error: 'Error en el servidor'
    });
  } finally {
    connection.release();
  }
};

// Actualizar estado de una reserva
export const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['activa', 'cancelada', 'sin asistencia', 'finalizada'];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }

    const [result] = await pool.query(
      'UPDATE reserva SET estado = ? WHERE id_reserva = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.json({
      success: true,
      mensaje: 'Reserva actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Cancelar (eliminar) una reserva
export const cancelarReserva = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Verificar que la reserva exista
    const [reserva] = await connection.query(
      'SELECT * FROM reserva WHERE id_reserva = ?',
      [id]
    );

    if (reserva.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // Eliminar participantes de la reserva
    await connection.query(
      'DELETE FROM reserva_participante WHERE id_reserva = ?',
      [id]
    );

    // Eliminar la reserva
    await connection.query(
      'DELETE FROM reserva WHERE id_reserva = ?',
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      mensaje: 'Reserva cancelada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  } finally {
    connection.release();
  }
};

// Marcar asistencia de un participante
export const marcarAsistencia = async (req, res) => {
  try {
    const { id_reserva, ci } = req.body;

    if (!id_reserva || !ci) {
      return res.status(400).json({
        error: 'ID de reserva y CI son requeridos'
      });
    }

    const [result] = await pool.query(
      'UPDATE reserva_participante SET asistencia = TRUE WHERE id_reserva = ? AND ci = ?',
      [id_reserva, ci]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Participante no encontrado en la reserva'
      });
    }

    res.json({
      success: true,
      mensaje: 'Asistencia marcada exitosamente'
    });

  } catch (error) {
    console.error('Error al marcar asistencia:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
