// backend/models/productoModel.js
import { pool } from '../config/db.js';

export const obtenerProductos = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.producto_id,
      p.piezas_id,
      p.cultura_id,
      p.tamanio_id,
      pi.nombre_pieza,
      c.cultura,
      t.tamanio,
      p.precio,
      p.stock
    FROM productos p
    JOIN piezas pi ON p.piezas_id = pi.piezas_id
    JOIN cultura c ON p.cultura_id = c.cultura_id
    JOIN tamanio t ON p.tamanio_id = t.tamanio_id
  `);
  return rows;
};

export const agregarProducto = async ({ piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen }) => {
  const [result] = await pool.query(
  'INSERT INTO productos (piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
  [piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen]
);
  return result;
};

// backend/models/productoModel.js

export const actualizarProducto = async (id, datos) => {
  if (!datos || Object.keys(datos).length === 0) {
    throw new Error('No se proporcionaron datos para actualizar');
  }

  const campos = [];
  const valores = [];

  for (const [clave, valor] of Object.entries(datos)) {
    campos.push(`${clave} = ?`);
    valores.push(valor);
  }

  campos.push('fecha_modificacion = NOW()');
  valores.push(id);

  const [result] = await pool.query(
    `UPDATE productos SET ${campos.join(', ')} WHERE producto_id = ?`,
    valores
  );

  return result;
};

export const eliminarProducto = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM productos WHERE producto_id = ?',
    [id]
  );
  return result;
};