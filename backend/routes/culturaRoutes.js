import express from 'express';
import {
  listarCulturas,
  crearCultura,
  eliminarCultura
} from '../controllers/culturaController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listarCulturas);
router.post('/', verificarUsuario, autorizarRoles([3]), crearCultura);
router.delete('/:id', verificarUsuario, autorizarRoles([3]), eliminarCultura);

export default router;
