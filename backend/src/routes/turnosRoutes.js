import express from 'express';
import {
  obtenerTurnos,
  verificarDisponibilidadTurno,
  obtenerTurnosDisponibles
} from '../controllers/turnosController.js';

const router = express.Router();

router.get('/', obtenerTurnos);
router.get('/disponibles', obtenerTurnosDisponibles);
router.get('/:id/disponibilidad', verificarDisponibilidadTurno);

export default router;
