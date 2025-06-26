// backend/routes/piezaRoutes.js
import express from 'express';
import {
  listarPiezas,
  crearPieza,
  eliminarPieza
} from '../controllers/piezaController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listarPiezas);
router.post('/', verificarUsuario, autorizarRoles(3), crearPieza);
router.delete('/:id', verificarUsuario, autorizarRoles(3), eliminarPieza);

export default router;