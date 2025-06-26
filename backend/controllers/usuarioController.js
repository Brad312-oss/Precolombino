import { pool } from '../config/db.js';

// Obtener todos los usuarios (solo para admin)
export const listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT u.usuario_id, u.cedula, u.nombre, u.apellido, u.correo, u.estado, r.nombre AS nombre_rol
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.rol_id
      `);
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Cambiar el rol de un usuario
export const cambiarRolUsuario = async (req, res) => {
  const { usuario_id, nuevo_rol } = req.body;

  if (!usuario_id || !nuevo_rol) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET id_rol = ? WHERE usuario_id = ?',
      [nuevo_rol, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const editarUsuario = async (req, res) => {
  const { usuario_id, nombre, apellido, correo, telefono, direccion } = req.body;

  if (!usuario_id || !nombre || !apellido || !correo) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ? WHERE usuario_id = ?',
      [nombre, apellido, correo, telefono, direccion, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const banearUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET estado = "baneado" WHERE usuario_id = ?',
      [usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario baneado correctamente' });
  } catch (error) {
    console.error('Error al banear usuario:', error);
    res.status(500).json({ message: 'Error al banear usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE usuario_id = ?', [usuario_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

import { enviarCorreoGenerico } from '../config/email.js';

export const enviarCorreoUsuario = async (req, res) => {
  const { correo, asunto, mensaje } = req.body;

  if (!correo || !asunto || !mensaje) {
    return res.status(400).json({ message: 'Faltan campos del correo' });
  }

  try {
    await enviarCorreoGenerico(correo, asunto, `<p>${mensaje}</p>`);
    res.json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
};

export const desbanearUsuario = async (req, res) => {
  const { usuario_id } = req.body;

  try {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET estado = ? WHERE usuario_id = ?',
      ['activo', usuario_id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario desbaneado exitosamente' });
  } catch (error) {
    console.error('Error al desbanear usuario:', error);
    res.status(500).json({ message: 'Error al desbanear usuario' });
  }
};
