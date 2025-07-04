import express from 'express';
import { crearResena, listarResenas } from '../controllers/resenaController.js';
import { verificarUsuario } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listarResenas);
router.post('/', verificarUsuario, crearResena);

export default router;
