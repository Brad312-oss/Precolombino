import { pool } from '../config/db.js';

export const listarResenas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.comentario, u.nombre, 
        CONCAT(pz.nombre_pieza, ' - ', c.cultura, ' - ', t.tamanio) AS nombre_producto
      FROM resenas r
      JOIN usuarios u ON u.usuario_id = r.usuario_id
      JOIN productos pr ON pr.producto_id = r.producto_id
      JOIN piezas pz ON pz.piezas_id = pr.piezas_id
      JOIN cultura c ON c.cultura_id = pr.cultura_id
      JOIN tamanio t ON t.tamanio_id = pr.tamanio_id
      ORDER BY r.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

export const crearResena = async (req, res) => {
  const { producto_id, comentario } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await pool.query(
      'INSERT INTO resenas (producto_id, usuario_id, comentario, fecha) VALUES (?, ?, ?, NOW())',
      [producto_id, usuario_id, comentario]
    );
    res.json({ message: 'Reseña enviada correctamente' });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error al crear reseña' });
  }
};
