import express from 'express';
import {
  obtenerParticipante,
  obtenerSanciones,
  verificarSancionesActivas,
  obtenerTodosParticipantes,
  obtenerHistorialReservas
} from '../controllers/participantesController.js';

const router = express.Router();

router.get('/', obtenerTodosParticipantes);
router.get('/:ci', obtenerParticipante);
router.get('/:ci/sanciones', obtenerSanciones);
router.get('/:ci/sanciones/activas', verificarSancionesActivas);
router.get('/:ci/historial-reservas', obtenerHistorialReservas);

export default router;
