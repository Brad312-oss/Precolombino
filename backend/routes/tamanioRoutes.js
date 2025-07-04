import express from 'express';
import {
  listarTamanios,
  crearTamanio,
  eliminarTamanio
} from '../controllers/tamanioController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listarTamanios);
router.post('/', verificarUsuario, autorizarRoles([3]), crearTamanio);
router.delete('/:id', verificarUsuario, autorizarRoles([3]), eliminarTamanio);

export default router;