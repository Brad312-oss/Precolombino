import express from 'express';
import {
  crearVenta,
  listarVentasConDetalles,
  actualizarEstadoVenta,
  obtenerVentas,
  generarReporteFiltrado
} from '../controllers/ventaController.js';

import {
  verificarUsuario,
  autorizarRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/ventas', verificarUsuario, autorizarRoles([3]), obtenerVentas); // ✅ admin
router.get('/detalles', verificarUsuario, autorizarRoles([3]), listarVentasConDetalles);
router.put('/actualizar-estado/:venta_id', verificarUsuario, autorizarRoles([3]), actualizarEstadoVenta);
router.get('/reporte/filtrado', verificarUsuario, autorizarRoles([3]), generarReporteFiltrado);
router.post('/', verificarUsuario, crearVenta);

export default router;