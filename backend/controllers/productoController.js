import {
  obtenerProductos,
  agregarProducto as modeloAgregar,
  actualizarProducto as modeloActualizar,
  eliminarProducto as modeloEliminar
} from '../models/productoModel.js';

import { pool } from '../config/db.js';

export const listarProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const obtenerStockProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT stock FROM productos WHERE producto_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ stock: rows[0].stock });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ message: 'Error al obtener stock' });
  }
};

export const agregarProducto = async (req, res) => {
  const { piezas_id, cultura_id, tamanio_id, descripcion, precio, stock } = req.body;
  const imagen = req.file ? `/uploads/productos/${req.file.filename}` : null;
  const usuarioId = req.usuario?.usuario_id;

  console.log('👤 ID del usuario autenticado (agregar):', usuarioId);

  if (!piezas_id || !cultura_id || !tamanio_id || !descripcion || !precio || !stock || !imagen) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, incluida la imagen' });
  }

  try {
    const resultado = await modeloAgregar({
      piezas_id,
      cultura_id,
      tamanio_id,
      descripcion,
      precio,
      stock,
      imagen,
      modificado_por: usuarioId
    });

    res.status(201).json({ message: 'Producto agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar producto:', error.message);
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
};

export const editarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    piezas_id,
    cultura_id,
    tamanio_id,
    descripcion,
    precio,
    stock
  } = req.body;

  const imagen = req.file ? `/uploads/productos/${req.file.filename}` : null;
  const usuarioId = req.usuario?.usuario_id;

  console.log('👤 ID del usuario autenticado (editar):', usuarioId); // ✅ DENTRO DE LA FUNCIÓN

  try {
    const productoData = {
      piezas_id,
      cultura_id,
      tamanio_id,
      descripcion,
      precio,
      stock,
      imagen,
      modificado_por: usuarioId
    };

    if (!imagen) delete productoData.imagen;

    const resultado = await modeloActualizar(id, productoData);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar producto:', error);
    res.status(500).json({ message: 'Error al editar producto' });
  }
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await modeloEliminar(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

export const obtenerReporteProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
  p.producto_id,
  piezas.nombre_pieza AS nombre,
  p.stock,
  p.precio,
  p.estado,
  u.nombre AS admin_nombre,
  u.apellido AS admin_apellido,
  p.fecha_modificacion AS ultima_modificacion
FROM productos p
JOIN piezas ON p.piezas_id = piezas.piezas_id
JOIN cultura ON p.cultura_id = cultura.cultura_id
JOIN tamanio ON p.tamanio_id = tamanio.tamanio_id
LEFT JOIN usuarios u ON p.modificado_por = u.usuario_id
ORDER BY p.stock DESC;
    `);

    res.json({ productos });
  } catch (error) {
    console.error('Error al obtener reporte de productos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

import { obtenerProductoPorId } from '../models/productoModel.js';

export const obtenerProductoDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await obtenerProductoPorId(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al obtener detalle del producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
