import { pool } from '../config/database.js';

// Mock de login (sin autenticación real por ahora)
export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        error: 'Correo y contraseña son requeridos'
      });
    }

    // Buscar el login
    const [loginRows] = await pool.query(
      'SELECT * FROM login WHERE correo = ?',
      [correo]
    );

    if (loginRows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const login = loginRows[0];

    // En producción aquí se compararía con bcrypt
    // Por ahora comparación directa (MOCK)
    if (login.contrasena !== contrasena) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Buscar datos del participante
    const [participanteRows] = await pool.query(
      'SELECT ci, nombre, apellido, email, rol FROM participante WHERE ci = ?',
      [login.ci]
    );

    if (participanteRows.length === 0) {
      return res.status(404).json({
        error: 'Participante no encontrado'
      });
    }

    const participante = participanteRows[0];

    // Mock token (en producción sería JWT)
    const token = `mock-token-${participante.ci}-${Date.now()}`;

    res.json({
      success: true,
      token,
      participante: {
        ci: participante.ci,
        nombre: participante.nombre,
        apellido: participante.apellido,
        email: participante.email,
        rol: participante.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Mock logout
export const logout = async (req, res) => {
  try {
    // En producción aquí se invalidaría el token
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};

// Mock me (obtener usuario actual)
export const me = async (req, res) => {
  try {
    // Por ahora mockeado, obtener CI desde query o header
    const ci = req.query.ci || req.headers['x-user-ci'];

    if (!ci) {
      return res.status(401).json({
        error: 'No autenticado'
      });
    }

    const [participanteRows] = await pool.query(
      'SELECT ci, nombre, apellido, email, rol FROM participante WHERE ci = ?',
      [ci]
    );

    if (participanteRows.length === 0) {
      return res.status(404).json({
        error: 'Participante no encontrado'
      });
    }

    const participante = participanteRows[0];

    res.json({
      success: true,
      participante: {
        ci: participante.ci,
        nombre: participante.nombre,
        apellido: participante.apellido,
        email: participante.email,
        rol: participante.rol
      }
    });

  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};
