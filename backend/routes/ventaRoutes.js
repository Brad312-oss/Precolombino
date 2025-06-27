// backend/routes/ventaRoutes.js
import express from 'express';
import {
  obtenerVentas,
  obtenerReporte,
  listarVentasConDetalles,
  crearVenta,
  actualizarEstadoVenta
} from '../controllers/ventaController.js';

import {
  verificarUsuario,
  autorizarRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/reporte', verificarUsuario, autorizarRoles([3]), obtenerReporte);
router.get('/ventas', verificarUsuario, autorizarRoles([3]), obtenerVentas); // ✅ admin
router.get('/detalles', verificarUsuario, autorizarRoles([3]), listarVentasConDetalles);
router.put('/actualizar-estado/:venta_id', verificarUsuario, autorizarRoles([3]), actualizarEstadoVenta);
router.post('/', verificarUsuario, autorizarRoles([3]), crearVenta);

export default router;