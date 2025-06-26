export const banearUsuario = async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ message: 'ID de usuario requerido' });
  }

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
    res.status(500).json({ message: 'Error del servidor' });
  }
};
