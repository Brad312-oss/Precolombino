import { enviarCorreoRecuperacion, enviarCorreoConfirmacion } from '../config/email.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import {
  buscarUsuarioPorCorreo,
  crearUsuario,
} from '../models/userModel.js';

export const register = async (req, res) => {
  const { nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, contraseña } = req.body;

  if (!nombre || !apellido || !correo || !cedula || !telefono || !direccion || !fecha_registro || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const userExistente = await buscarUsuarioPorCorreo(correo);
  if (userExistente) {
    return res.status(400).json({ message: 'Usuario ya registrado' });
  }

  const hash = await bcrypt.hash(contraseña, 10);
  const id_rol = 1;
  await crearUsuario(nombre, apellido, correo, cedula, telefono, direccion, fecha_registro, hash, id_rol);
  await enviarCorreoConfirmacion(correo, nombre);

  res.status(201).json({ message: 'Usuario creado exitosamente' });
};

export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  const usuario = await buscarUsuarioPorCorreo(correo);
  const credencialesValidas = usuario && await bcrypt.compare(contraseña, usuario.contraseña);

  if (!credencialesValidas) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  if (usuario.estado === 'baneado') {
    return res.status(403).json({ message: 'Usuario baneado. Acceso denegado.' });
  }

  const token = jwt.sign(
    { usuario_id: usuario.usuario_id, correo: usuario.correo, id_rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  await pool.query(
    'UPDATE usuarios SET last_login = NOW() WHERE usuario_id = ?',
    [usuario.usuario_id]
  );

  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    token,
    usuario: {
      usuario_id: usuario.usuario_id,
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo
    }
  });
};

export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Correo no encontrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
      'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE correo = ?',
      [token, expira, correo]
    );

    const resetLink = `http://localhost:3000/pages/reset.html?token=${token}&correo=${correo}`;

    await enviarCorreoRecuperacion(correo, rows[0].nombre, resetLink);

    res.json({ message: 'Correo de recuperación enviado' });

  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const cambiarContrasena = async (req, res) => {
  const { correo, token, nuevaContrasena } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? AND reset_token = ? AND reset_token_expira > NOW()',
      [correo, token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await pool.query(
      'UPDATE usuarios SET contraseña = ?, reset_token = NULL, reset_token_expira = NULL WHERE correo = ?',
      [hash, correo]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};