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
export async function listarVentasConDetalles(req, res) {
  try {
    const { id } = req.query;

    if (id) {
      // Obtener solo el detalle de UNA venta
      const [detalles] = await pool.query(`
        SELECT dv.*, pi.nombre_pieza AS nombre_producto
        FROM detalle_de_venta dv
        JOIN productos pr ON dv.producto_id = pr.producto_id
        JOIN piezas pi ON pr.piezas_id = pi.piezas_id
        WHERE dv.venta_id = ?
        `, [id]);
      return res.json(detalles);
    }

    // Si no hay ?id, listar TODAS las ventas
    const [ventas] = await pool.query(`
      SELECT v.venta_id AS venta_id, u.nombre AS nombre_cliente, v.fecha, v.estado, v.total
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.usuario_id
    `);

    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
}

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

// Actualizar estado de una venta
export const actualizarEstadoVenta = async (req, res) => {
  const { venta_id } = req.params;
  const { estado } = req.body;

  if (!['en proceso', 'entregada', 'cancelada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE ventas SET estado = ? WHERE venta_id = ?',
      [estado, venta_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    res.json({ message: 'Estado de la venta actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado de la venta:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la venta' });
  }
};

// Obtener todas las ventas (sin detalles)
export const obtenerVentas = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT v.venta_id, u.nombre AS nombre_cliente, v.fecha, v.total, v.estado
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.usuario_id
      ORDER BY v.fecha DESC
    `);

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};