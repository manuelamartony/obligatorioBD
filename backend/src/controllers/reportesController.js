import { pool } from '../config/database.js';

// 1. Salas más reservadas en un período
export const salasMasReservadas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    const query = `
      SELECT
        r.nombre_sala,
        r.edificio,
        COUNT(*) as cantidad_reservas,
        s.capacidad,
        s.tipo_sala
      FROM reserva r
      INNER JOIN sala s ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
      WHERE r.fecha BETWEEN ? AND ?
      GROUP BY r.nombre_sala, r.edificio, s.capacidad, s.tipo_sala
      ORDER BY cantidad_reservas DESC
      LIMIT 10
    `;

    const [resultados] = await pool.query(query, [fecha_inicio, fecha_fin]);

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      salas: resultados
    });

  } catch (error) {
    console.error('Error en reporte de salas más reservadas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// 2. Turnos más demandados
export const turnosDemandados = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    const query = `
      SELECT
        t.id_turno,
        t.hora_inicio,
        t.hora_fin,
        COUNT(*) as cantidad_reservas
      FROM reserva r
      INNER JOIN turno t ON r.id_turno = t.id_turno
      WHERE r.fecha BETWEEN ? AND ?
      GROUP BY t.id_turno, t.hora_inicio, t.hora_fin
      ORDER BY cantidad_reservas DESC
    `;

    const [resultados] = await pool.query(query, [fecha_inicio, fecha_fin]);

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      turnos: resultados
    });

  } catch (error) {
    console.error('Error en reporte de turnos demandados:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// 3. Promedio de participantes por sala
export const promedioParticipantes = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    const query = `
      SELECT
        r.nombre_sala,
        r.edificio,
        s.capacidad,
        AVG(participantes_count) as promedio_participantes,
        COUNT(*) as total_reservas
      FROM reserva r
      INNER JOIN sala s ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
      LEFT JOIN (
        SELECT id_reserva, COUNT(*) as participantes_count
        FROM reserva_participante
        GROUP BY id_reserva
      ) rp ON r.id_reserva = rp.id_reserva
      WHERE r.fecha BETWEEN ? AND ?
      GROUP BY r.nombre_sala, r.edificio, s.capacidad
      ORDER BY promedio_participantes DESC
    `;

    const [resultados] = await pool.query(query, [fecha_inicio, fecha_fin]);

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      salas: resultados
    });

  } catch (error) {
    console.error('Error en reporte de promedio de participantes:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// 4. Reservas por facultad
export const reservasPorFacultad = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    const query = `
      SELECT
        f.nombre_facultad,
        COUNT(DISTINCT r.id_reserva) as cantidad_reservas,
        COUNT(DISTINCT p.ci) as participantes_unicos
      FROM reserva r
      INNER JOIN participante p ON r.ci = p.ci
      INNER JOIN participante_programa_académico ppa ON p.ci = ppa.ci
      INNER JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
      INNER JOIN facultad f ON pa.id_facultad = f.id_facultad
      WHERE r.fecha BETWEEN ? AND ?
      GROUP BY f.id_facultad, f.nombre_facultad
      ORDER BY cantidad_reservas DESC
    `;

    const [resultados] = await pool.query(query, [fecha_inicio, fecha_fin]);

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      facultades: resultados
    });

  } catch (error) {
    console.error('Error en reporte de reservas por facultad:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// 5. Ocupación de salas por edificio
export const ocupacionEdificios = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        error: 'fecha es requerida'
      });
    }

    const query = `
      SELECT
        e.nombre_edificio,
        e.direccion,
        COUNT(DISTINCT s.nombre_sala) as total_salas,
        COUNT(DISTINCT r.nombre_sala) as salas_utilizadas,
        ROUND((COUNT(DISTINCT r.nombre_sala) / COUNT(DISTINCT s.nombre_sala)) * 100, 2) as ocupacion_porcentaje,
        COUNT(r.id_reserva) as total_reservas
      FROM edificio e
      INNER JOIN sala s ON e.nombre_edificio = s.edificio
      LEFT JOIN reserva r ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio
        AND r.fecha = ? AND r.estado IN ('activa', 'finalizada')
      GROUP BY e.nombre_edificio, e.direccion
      ORDER BY ocupacion_porcentaje DESC
    `;

    const [resultados] = await pool.query(query, [fecha]);

    res.json({
      success: true,
      fecha,
      edificios: resultados
    });

  } catch (error) {
    console.error('Error en reporte de ocupación de edificios:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// 6. Cantidad total de reservas con desglose por estado
export const cantidadReservas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    // Consulta principal: total por estado
    const queryPorEstado = `
      SELECT
        estado,
        COUNT(*) as cantidad
      FROM reserva
      WHERE fecha BETWEEN ? AND ?
      ${estado ? 'AND estado = ?' : ''}
      GROUP BY estado
    `;

    const params = [fecha_inicio, fecha_fin];
    if (estado) params.push(estado);

    const [porEstado] = await pool.query(queryPorEstado, params);

    // Consulta de totales
    const queryTotal = `
      SELECT
        COUNT(*) as total_reservas,
        COUNT(DISTINCT ci) as usuarios_unicos,
        COUNT(DISTINCT DATE(fecha)) as dias_con_reservas
      FROM reserva
      WHERE fecha BETWEEN ? AND ?
      ${estado ? 'AND estado = ?' : ''}
    `;

    const [totales] = await pool.query(queryTotal, params);

    // Formatear respuesta
    const desglosePorEstado = {
      activa: 0,
      cancelada: 0,
      sin_asistencia: 0,
      finalizada: 0
    };

    porEstado.forEach(item => {
      desglosePorEstado[item.estado] = item.cantidad;
    });

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      filtro_estado: estado || 'todos',
      total_reservas: totales[0].total_reservas,
      usuarios_unicos: totales[0].usuarios_unicos,
      dias_con_reservas: totales[0].dias_con_reservas,
      por_estado: desglosePorEstado
    });

  } catch (error) {
    console.error('Error en reporte de cantidad de reservas:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// BONUS: Reporte general del sistema
export const reporteGeneral = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'fecha_inicio y fecha_fin son requeridas'
      });
    }

    // Obtener múltiples métricas en paralelo
    const [
      [totalReservas],
      [totalSalas],
      [totalEdificios],
      [totalParticipantes],
      [reservasPorEstado]
    ] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) as total FROM reserva WHERE fecha BETWEEN ? AND ?',
        [fecha_inicio, fecha_fin]
      ),
      pool.query('SELECT COUNT(*) as total FROM sala'),
      pool.query('SELECT COUNT(*) as total FROM edificio'),
      pool.query(
        'SELECT COUNT(DISTINCT ci) as total FROM participante'
      ),
      pool.query(
        'SELECT estado, COUNT(*) as cantidad FROM reserva WHERE fecha BETWEEN ? AND ? GROUP BY estado',
        [fecha_inicio, fecha_fin]
      )
    ]);

    res.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      metricas_generales: {
        total_reservas: totalReservas[0].total,
        total_salas: totalSalas[0].total,
        total_edificios: totalEdificios[0].total,
        total_participantes: totalParticipantes[0].total
      },
      reservas_por_estado: reservasPorEstado
    });

  } catch (error) {
    console.error('Error en reporte general:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
