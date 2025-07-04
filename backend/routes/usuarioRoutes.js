import express from 'express';
import {
  listarUsuarios,
  cambiarRolUsuario,
  editarUsuario,
  banearUsuario,
  eliminarUsuario,
  enviarCorreoUsuario,
  desbanearUsuario,
  obtenerClientes,
  obtenerEstadisticasUsuarios,
  actualizarPerfilCliente,
} from '../controllers/usuarioController.js';
import { verificarUsuario, autorizarRoles,} from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas para administradores
router.get('/clientes', verificarUsuario, autorizarRoles([3]), obtenerClientes);
router.get('/listar', verificarUsuario, autorizarRoles([3]), listarUsuarios);
router.put('/cambiar-rol', verificarUsuario, autorizarRoles([3]), cambiarRolUsuario);
router.put('/editar', verificarUsuario, autorizarRoles([3]), editarUsuario);
router.put('/:usuario_id/banear', verificarUsuario, autorizarRoles([3]), banearUsuario);
router.delete('/eliminar/:usuario_id', verificarUsuario, autorizarRoles([3]), eliminarUsuario);
router.post('/enviar-correo', verificarUsuario, autorizarRoles([3]), enviarCorreoUsuario);
router.put('/desbanear', verificarUsuario, autorizarRoles([3]), desbanearUsuario);
router.get('/reporte/usuarios', verificarUsuario, autorizarRoles([3]), obtenerEstadisticasUsuarios);
router.put('/actualizar-perfil', verificarUsuario, actualizarPerfilCliente);

export default router;
