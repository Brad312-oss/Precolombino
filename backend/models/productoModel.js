import { pool } from '../config/db.js';

export const obtenerProductos = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.producto_id,
      p.descripcion,
      p.imagen,
      p.precio,
      p.stock,
      c.cultura,
      pi.nombre_pieza,
      t.tamanio
    FROM productos p
    JOIN cultura c ON p.cultura_id = c.cultura_id
    JOIN piezas pi ON p.piezas_id = pi.piezas_id
    JOIN tamanio t ON p.tamanio_id = t.tamanio_id
    WHERE p.estado = 'disponible'
  `);
  return rows;
};

export const agregarProducto = async ({ piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, modificado_por }) => {
  const [result] = await pool.query(
    `INSERT INTO productos 
    (piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, fecha_modificacion, modificado_por) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [piezas_id, cultura_id, tamanio_id, precio, stock, descripcion, imagen, modificado_por]
  );
  return result;
};

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

export async function obtenerProductoPorId(id) {
  const [rows] = await pool.query(`
    SELECT 
      p.producto_id,
      piezas.nombre_pieza AS pieza,
      cultura.cultura AS cultura,
      tamanio.tamanio AS tamanio,
      p.descripcion,
      p.imagen,
      p.precio,
      p.stock,
      p.estado
    FROM productos p
    JOIN piezas ON p.piezas_id = piezas.piezas_id
    JOIN cultura ON p.cultura_id = cultura.cultura_id
    JOIN tamanio ON p.tamanio_id = tamanio.tamanio_id
    WHERE p.producto_id = ?
  `, [id]);

  return rows[0];
}
