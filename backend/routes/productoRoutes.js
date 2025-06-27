// backend/routes/productoRoutes.js
import express from 'express';
import {
  listarProductos,
  obtenerStockProducto,
  agregarProducto,
  editarProducto,
  eliminarProducto
} from '../controllers/productoController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// 📦 Rutas públicas
router.get('/', listarProductos);
router.get('/stock/:id', obtenerStockProducto);

// 🛡️ Rutas protegidas (solo admin: rol 3)
router.post(
  '/',
  upload.single('imagen'),      // 🔄 primero procesa form-data
  verificarUsuario,             // luego verifica usuario con req.body ya definido
  autorizarRoles([3]),
  agregarProducto
);

router.put(
  '/:id',
  upload.single('imagen'),       // Procesa FormData
  verificarUsuario,
  autorizarRoles([3]),
  editarProducto
);

router.delete(
  '/:id',
  verificarUsuario,
  autorizarRoles([3]),
  eliminarProducto
);

export default router;