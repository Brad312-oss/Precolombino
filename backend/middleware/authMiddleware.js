import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function obtenerIdRolPorNombre(nombreRol) {
  const [rows] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombreRol]);
  return rows[0]?.id;
}

export const verificarUsuario = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [result] = await pool.query(
      'SELECT estado FROM usuarios WHERE usuario_id = ?',
      [decoded.usuario_id]
    );

    if (!result.length || result[0].estado !== 'activo') {
      return res.status(401).json({ message: 'Usuario inactivo o no encontrado' });
    }

    req.usuario = {
      id: decoded.usuario_id,
      correo: decoded.correo,
      id_rol: decoded.id_rol
    };

    next();
  } catch (error) {
    console.error('Error en verificarUsuario:', error);
    return res.status(401).json({ message: 'Token inválido o usuario no autenticado' });
  }
};

export function autorizarRoles(rolesPermitidos) {
  return (req, res, next) => {
    if (!Array.isArray(rolesPermitidos)) {
      return res.status(500).json({ message: 'Error interno: rolesPermitidos debe ser un array' });
    }

    const rolUsuario = req.usuario.id_rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permisos.' });
    }

    next();
  };
}