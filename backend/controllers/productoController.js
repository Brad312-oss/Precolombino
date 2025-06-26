// backend/controllers/productoController.js

import {
  obtenerProductos,
  agregarProducto as modeloAgregar,
  actualizarProducto as modeloActualizar,
  eliminarProducto as modeloEliminar
} from '../models/productoModel.js';

import { pool } from '../config/db.js'; // Para obtener el stock

// 📦 Obtener todos los productos
export const listarProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// 📦 Obtener solo el stock de un producto
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

// ➕ Agregar nuevo producto con imagen
export const agregarProducto = async (req, res) => {
  const { piezas_id, cultura_id, tamanio_id, descripcion, precio, stock } = req.body;
  const imagen = req.file ? `/uploads/productos/${req.file.filename}` : null;

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
      imagen
    });

    res.status(201).json({ message: 'Producto agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar producto:', error.message);
    res.status(500).json({ message: 'Error al agregar producto', error: error.message });
  }
};

// ✏️ Editar producto existente
// backend/controllers/productoController.js

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

  try {
    const productoData = {
      piezas_id,
      cultura_id,
      tamanio_id,
      descripcion,
      precio,
      stock,
      imagen
    };

    // Si no se sube nueva imagen, eliminamos "imagen" del objeto
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


// ❌ Eliminar producto
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