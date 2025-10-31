import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import turnosRoutes from './routes/turnosRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js';
import facultadesRoutes from './routes/facultadesRoutes.js';
import participantesRoutes from './routes/participantesRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple para desarrollo
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api', facultadesRoutes);
app.use('/api/participantes', participantesRoutes);

// Swagger UI
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Sistema de Reservas de Salones',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      reservas: '/api/reservas',
      salas: '/api/salas',
      turnos: '/api/turnos',
      reportes: '/api/reportes',
      facultades: '/api/facultades',
      programas: '/api/programas',
      participantes: '/api/participantes',
      health: '/api/health'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nEndpoints disponibles:');
      console.log('  POST   /api/auth/login');
      console.log('  POST   /api/auth/logout');
      console.log('  GET    /api/auth/me');
      console.log('  GET    /api/reservas');
      console.log('  POST   /api/reservas');
      console.log('  GET    /api/salas');
      console.log('  GET    /api/turnos');
      console.log('  GET    /api/reportes/*');
      console.log('  GET    /api/facultades');
      console.log('  GET    /api/participantes');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
