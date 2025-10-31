import express from 'express';
import {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  cancelarReserva,
  marcarAsistencia
} from '../controllers/reservasController.js';

const router = express.Router();

router.get('/', obtenerReservas);
router.get('/:id', obtenerReservaPorId);
router.post('/', crearReserva);
router.put('/:id', actualizarReserva);
router.delete('/:id', cancelarReserva);
router.post('/asistencia', marcarAsistencia);

export default router;
