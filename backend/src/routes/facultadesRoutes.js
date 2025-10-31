import express from 'express';
import {
  obtenerFacultades,
  obtenerProgramas,
  obtenerProgramasPorFacultad,
  obtenerTiposProgramas
} from '../controllers/facultadesController.js';

const router = express.Router();

router.get('/facultades', obtenerFacultades);
router.get('/programas', obtenerProgramas);
router.get('/programas/tipos', obtenerTiposProgramas);
router.get('/facultades/:id_facultad/programas', obtenerProgramasPorFacultad);

export default router;
