import express from 'express';
import {
  login,
  register,
  solicitarRecuperacion,
  cambiarContrasena
} from '../controllers/authController.js';
import { verificarUsuario } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/cambiar-contrasena', cambiarContrasena);

router.get('/verificar', verificarUsuario, (req, res) => {
  res.json({ usuario: req.usuario });
});

export default router;
