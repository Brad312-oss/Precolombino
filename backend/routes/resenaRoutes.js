import express from 'express';
import { crearResena, listarResenas } from '../controllers/resenaController.js';
import { verificarUsuario } from '../middleware/authMiddleware.js';

const router = express.Router();
<<<<<<< HEAD

// Ruta para listar todas las reseñas (acceso público)
router.get('/', listarResenas);

// Ruta para crear una nueva reseña
// Requiere que el usuario esté autenticado
router.post('/', verificarUsuario, crearResena);

export default router;
=======
>>>>>>> 1ff176f564291a3fca580acacaaf208b277bfcc7
