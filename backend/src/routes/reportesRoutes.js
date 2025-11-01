import express from 'express';
import {
  salasMasReservadas,
  turnosDemandados,
  promedioParticipantes,
  reservasPorFacultad,
  ocupacionEdificios,
  cantidadReservas,
  reporteGeneral
} from '../controllers/reportesController.js';

const router = express.Router();

router.get('/salas-mas-reservadas', salasMasReservadas);
router.get('/turnos-demandados', turnosDemandados);
router.get('/promedio-participantes', promedioParticipantes);
router.get('/reservas-por-facultad', reservasPorFacultad);
router.get('/ocupacion-edificios', ocupacionEdificios);
router.get('/cantidad-reservas', cantidadReservas);
router.get('/general', reporteGeneral);

export default router;
