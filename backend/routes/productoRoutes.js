// backend/routes/productoRoutes.js
import express from 'express';
import {
  listarProductos,
  obtenerStockProducto,
  agregarProducto,
  editarProducto,
  eliminarProducto,
  obtenerReporteProductos,
  obtenerProductoDetalle
} from '../controllers/productoController.js';

import { verificarUsuario, autorizarRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/reporte/productos', verificarUsuario, autorizarRoles([3]), obtenerReporteProductos);

// 📦 Rutas públicas
router.get('/', listarProductos);
router.get('/stock/:id', obtenerStockProducto);

router.delete(
  '/:id',
  verificarUsuario,
  autorizarRoles([3]),
  eliminarProducto
);

// 🛡️ Rutas protegidas (solo admin: rol 3)
router.post(
  '/',
  verificarUsuario,
  autorizarRoles([3]),
  upload.single('imagen'),
  agregarProducto
);

router.put(
  '/:id',
  verificarUsuario,
  autorizarRoles([3]),
  upload.single('imagen'),
  editarProducto
);

router.get('/:id', obtenerProductoDetalle);

export default router;



