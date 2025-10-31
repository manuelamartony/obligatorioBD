import express from 'express';
import {
  obtenerSalas,
  obtenerDisponibilidadSala,
  obtenerEdificios,
  obtenerSalasPorEdificio
} from '../controllers/salasController.js';

const router = express.Router();

router.get('/', obtenerSalas);
router.get('/:nombre/disponibilidad', obtenerDisponibilidadSala);
router.get('/edificios/todos', obtenerEdificios);
router.get('/edificio/:edificio', obtenerSalasPorEdificio);

export default router;
