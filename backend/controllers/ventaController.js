import pool from '../config/db.js';

// Registrar una nueva venta
export const crearVenta = async (req, res) => {
  const { usuario_id, fecha, total, productos } = req.body;

  if (!usuario_id || isNaN(usuario_id)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'Debe enviar al menos un producto' });
  }

  for (const p of productos) {
    if (!p.producto_id || isNaN(p.producto_id) || !p.cantidad || isNaN(p.cantidad)) {
      return res.status(400).json({ message: 'Producto mal formado' });
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const producto of productos) {
      const [rows] = await connection.query(
        'SELECT stock FROM productos WHERE producto_id = ? FOR UPDATE',
        [producto.producto_id]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Producto ID ${producto.producto_id} no encontrado` });
      }

      const stockDisponible = rows[0].stock;
      if (producto.cantidad > stockDisponible) {
        await connection.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para el producto ID ${producto.producto_id}. Disponible: ${stockDisponible}, Solicitado: ${producto.cantidad}`
        });
      }

      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE producto_id = ?',
        [producto.cantidad, producto.producto_id]
      );
    }

    const [ventaResult] = await connection.query(
      'INSERT INTO ventas (usuario_id, fecha, total) VALUES (?, ?, ?)',
      [usuario_id, fecha, total]
    );
    const ventaId = ventaResult.insertId;

    for (const producto of productos) {
      await connection.query(
        'INSERT INTO detalle_de_venta (venta_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [ventaId, producto.producto_id, producto.cantidad, producto.subtotal || 0]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Venta registrada correctamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar venta:', error);
    res.status(500).json({ message: 'Error al registrar la venta' });
  } finally {
    connection.release();
  }
};

// Listar todas las ventas con detalles
export const listarVentasConDetalles = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT v.venta_id, v.fecha, v.total, u.nombre AS cliente
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.usuario_id
      ORDER BY v.fecha DESC
    `);

    for (const venta of ventas) {
      const [detalles] = await pool.query(`
        SELECT d.producto_id, p.nombre_pieza, d.cantidad, d.subtotal
        FROM detalle_de_venta d
        JOIN productos pr ON d.producto_id = pr.producto_id
        JOIN piezas p ON pr.piezas_id = p.piezas_id
        WHERE d.venta_id = ?
      `, [venta.venta_id]);

      venta.detalles = detalles;
    }

    res.json(ventas);
  } catch (error) {
    console.error('Error al listar ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

// Obtener reporte simple de ventas
export const obtenerReporte = async (req, res) => {
  try {
    const [reporte] = await pool.query(`
      SELECT COUNT(*) AS total_ventas, SUM(total) AS total_ingresos FROM ventas
    `);
    res.json(reporte[0]);
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al obtener el reporte' });
  }
};

// Alias para crearVenta
export const registrarVenta = crearVenta;
