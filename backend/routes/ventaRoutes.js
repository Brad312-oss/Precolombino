// backend/routes/ventaRoutes.js
import express from 'express';
import {
  obtenerReporte,
  listarVentasConDetalles,
  crearVenta
} from '../controllers/ventaController.js';
import {
  verificarUsuario,
  autorizarRoles,
  verificarRol // opcional
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/reporte', obtenerReporte);
router.get('/detalles', listarVentasConDetalles);

router.post('/', verificarUsuario, autorizarRoles(2, 3), crearVenta);

export default router;
