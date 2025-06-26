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
    
    req.usuario = decoded; // ahora puedes usar req.usuario.correo, req.usuario.id, req.usuario.id_rol
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

// ✅ Autoriza por roles (por ID de rol)
export function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.id_rol)) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado por rol' });
    }
    next();
  };
}

// ✅ Verifica correo y rol directamente (opcional, solo si lo usas)
export async function verificarRol(req, res, next) {
  try {
    const { correo, rol } = req.body;
    if (!correo || !rol) {
      return res.status(400).json({ mensaje: 'Correo y rol son requeridos' });
    }

    const [result] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? AND id_rol = ?',
      [correo, rol]
    );

    if (result.length === 0) {
      return res.status(403).json({ mensaje: 'Acceso no autorizado: rol incorrecto' });
    }

    next();
  } catch (error) {
    console.error('Error en verificarRol:', error);
    res.status(500).json({ mensaje: 'Error del servidor al verificar el rol' });
  }
}