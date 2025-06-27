import express from 'express';
import {
  login,
  register,
  solicitarRecuperacion,
  cambiarContrasena
} from '../controllers/authController.js';
import { verificarUsuario } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.post('/cambiar-contrasena', cambiarContrasena);

// ✅ Ruta protegida para verificar token y devolver datos del usuario
router.get('/verificar', verificarUsuario, (req, res) => {
  res.json({ usuario: req.usuario }); // Devuelve info del token decodificado
});

export default router;
