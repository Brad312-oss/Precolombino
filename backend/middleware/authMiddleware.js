import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// ✅ Obtener el ID del rol por su nombre
export async function obtenerIdRolPorNombre(nombreRol) {
  const [rows] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombreRol]);
  return rows[0]?.id;
}

// ✅ Verifica el token JWT y añade los datos del usuario a req.usuario

export async function verificarUsuario(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Opcional: puedes validar también que el ID exista y esté activo en la base de datos
    const [result] = await pool.query(
      'SELECT estado FROM usuarios WHERE correo = ?',
      [decoded.correo]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (result[0].estado === 'baneado') {
      return res.status(403).json({ message: 'Usuario baneado. Acceso denegado.' });
    }

    // ✅ Esta línea es esencial para que el frontend obtenga el rol y demás datos
    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

// ✅ Autoriza por roles (por ID de rol)
// En authMiddleware.js
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