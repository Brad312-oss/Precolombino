import pool from '../config/db.js';

// Registrar una nueva venta
export const crearVenta = async (req, res) => {
  if (!req.usuario || !req.usuario.id || isNaN(req.usuario.id)) {
    return res.status(401).json({ message: 'Token inválido o usuario no autenticado' });
  }

  console.log('BODY RECIBIDO EN /api/ventas:', req.body);
  const { fecha, total, tipo_pago, productos } = req.body;

  const usuario_id = req.usuario.id_rol === 3 && req.body.usuario_id
    ? req.body.usuario_id
    : req.usuario.id;

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
      'INSERT INTO ventas (usuario_id, fecha, total, tipo_pago) VALUES (?, ?, ?, ?)',
      [usuario_id, fecha, total, tipo_pago]
    );
    const ventaId = ventaResult.insertId;

    for (const producto of productos) {
      const [rowsPrecio] = await connection.query(
        'SELECT precio FROM productos WHERE producto_id = ?',
        [producto.producto_id]
      );
      const precioUnitario = rowsPrecio[0].precio;
      const subtotal = producto.cantidad * precioUnitario;

      await connection.query(
        'INSERT INTO detalle_de_venta (venta_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [ventaId, producto.producto_id, producto.cantidad, subtotal]
      );
    }

    await connection.commit();

    const [detalles] = await pool.query(`
      SELECT 
      p.producto_id,
      piezas.nombre_pieza AS nombre_pieza,
      cultura.cultura AS cultura,
      tamanio.tamanio AS tamanio,
      p.precio,
      dv.cantidad,
      dv.subtotal
      FROM detalle_de_venta dv
      JOIN productos p ON p.producto_id = dv.producto_id
      JOIN piezas ON piezas.piezas_id = p.piezas_id
      JOIN cultura ON cultura.cultura_id = p.cultura_id
      JOIN tamanio ON tamanio.tamanio_id = p.tamanio_id
      WHERE dv.venta_id = ?
    `, [ventaId]);

    res.status(201).json({
      message: 'Venta registrada correctamente',
      tipo_pago,
      total,
      productos: detalles
    });

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

// ✅ Reporte completo de ventas (productos + usuario + detalles)
export const generarReporteFiltrado = async (req, res) => {
  try {
    const {
      comprador,
      cultura,
      producto,
      estado,
      fechaInicio,
      fechaFin
    } = req.query;

    let query = `
      SELECT 
        v.venta_id,
        v.fecha,
        v.estado,
        v.total,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido,
        dv.cantidad,
        dv.subtotal,
        CONCAT(pi.nombre_pieza, ' ', cu.cultura, ' ', t.tamanio) AS producto_nombre
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.usuario_id
      JOIN detalle_de_venta dv ON v.venta_id = dv.venta_id
      JOIN productos p ON dv.producto_id = p.producto_id
      JOIN piezas pi ON p.piezas_id = pi.piezas_id
      JOIN cultura cu ON p.cultura_id = cu.cultura_id
      JOIN tamanio t ON p.tamanio_id = t.tamanio_id
      WHERE 1=1
    `;

    const params = [];

    if (comprador) {
      query += ` AND CONCAT(u.nombre, ' ', u.apellido) LIKE ?`;
      params.push(`%${comprador}%`);
    }

    if (cultura) {
      query += ` AND cu.cultura LIKE ?`;
      params.push(`%${cultura}%`);
    }

    if (producto) {
      query += ` AND CONCAT(pi.nombre_pieza, ' ', cu.cultura, ' ', t.tamanio) LIKE ?`;
      params.push(`%${producto}%`);
    }

    if (estado) {
      query += ` AND v.estado = ?`;
      params.push(estado);
    }

    if (fechaInicio && fechaFin) {
      query += ` AND v.fecha BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    }

    query += ` ORDER BY v.fecha DESC`;

    const [filtrado] = await pool.query(query, params);
    res.json(filtrado);
  } catch (error) {
    console.error('Error al generar reporte filtrado:', error);
    res.status(500).json({ mensaje: 'Error al generar el reporte filtrado' });
  }
};