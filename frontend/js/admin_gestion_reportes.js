async function filtrarReporte() {
  try {
    const token = localStorage.getItem('token');

    const params = new URLSearchParams({
      comprador: document.getElementById('filtroComprador').value,
      cultura: document.getElementById('filtroCultura').value,
      producto: document.getElementById('filtroProducto').value,
      estado: document.getElementById('filtroEstado').value,
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFin: document.getElementById('fechaFin').value
    });

    const res = await fetch(`/api/ventas/reporte/filtrado?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const datos = await res.json();

    const tabla = document.getElementById('tablaReporteVentas');
    tabla.innerHTML = '';

    const ventasAgrupadas = {};

    if (Array.isArray(datos)) {
      datos.forEach(item => {
        if (!ventasAgrupadas[item.venta_id]) {
          ventasAgrupadas[item.venta_id] = {
            cliente: `${item.cliente_nombre} ${item.cliente_apellido}`,
            fecha: item.fecha,
            estado: item.estado,
            total: item.total,
            productos: [],
          };
        }
        ventasAgrupadas[item.venta_id].productos.push({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });
      });
    } else {
      alert('Error: no se pudo cargar el reporte.');
      return;
    }

    Object.entries(ventasAgrupadas).forEach(([id, venta]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${venta.cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>$${venta.total}</td>
        <td>
          <ul>
            ${venta.productos.map(p => `<li>${p.descripcion} (x${p.cantidad}) - $${p.subtotal}</li>`).join('')}
          </ul>
        </td>
      `;
      tabla.appendChild(tr);
    });

  } catch (error) {
    console.error('Error cargando el reporte de ventas:', error);
  }
}

async function filtrarReporte2() {
  try {
    const token = localStorage.getItem('token');

    const params = new URLSearchParams({
      comprador: document.getElementById('filtroComprador2').value,
      cultura: document.getElementById('filtroCultura2').value,
      producto: document.getElementById('filtroProducto2').value,
      estado: document.getElementById('filtroEstado2').value,
      fechaInicio: document.getElementById('fechaInicio2').value,
      fechaFin: document.getElementById('fechaFin2').value
    });

    const res = await fetch(`/api/ventas/reporte/filtrado?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const datos = await res.json();

    const tabla = document.getElementById('tablaReporteVentas2');
    tabla.innerHTML = '';

    const ventasAgrupadas = {};

    if (Array.isArray(datos)) {
      datos.forEach(item => {
        if (!ventasAgrupadas[item.venta_id]) {
          ventasAgrupadas[item.venta_id] = {
            cliente: `${item.cliente_nombre} ${item.cliente_apellido}`,
            fecha: item.fecha,
            estado: item.estado,
            total: item.total,
            productos: [],
          };
        }
        ventasAgrupadas[item.venta_id].productos.push({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        });
      });
    } else {
      alert('Error: no se pudo cargar el reporte.');
      return;
    }

    Object.entries(ventasAgrupadas).forEach(([id, venta]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${id}</td>
        <td>${venta.cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>$${venta.total}</td>
        <td>
          <ul>
            ${venta.productos.map(p => `<li>${p.descripcion} (x${p.cantidad}) - $${p.subtotal}</li>`).join('')}
          </ul>
        </td>
      `;
      tabla.appendChild(tr);
    });

  } catch (error) {
    console.error('Error cargando el reporte de ventas:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('btnFiltrar1');
  const btn2 = document.getElementById('btnFiltrar2');

  if (btn1) btn1.addEventListener('click', filtrarReporte);
  if (btn2) btn2.addEventListener('click', filtrarReporte2);
});

async function generarReporteUsuarios() {
  const fechaInicio = document.getElementById('fechaInicioUsuarios').value;
  const fechaFin = document.getElementById('fechaFinUsuarios').value;

  if (!fechaInicio || !fechaFin) {
    alert('Por favor selecciona ambas fechas para generar el reporte.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/usuarios/reporte/usuarios?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener estadísticas');

    const { resumen, detalle } = data;

    document.getElementById('totalNuevos').textContent = resumen.total_nuevos;
    document.getElementById('totalBaneados').textContent = resumen.total_baneados;

    // Detalle por rol
    const contenedorRoles = document.getElementById('resumenPorRol');
    contenedorRoles.innerHTML = '';
    resumen.porRol.forEach(({ rol, cantidad }) => {
      const p = document.createElement('p');
      p.textContent = `🔸 ${rol}: ${cantidad} usuario(s)`;
      contenedorRoles.appendChild(p);
    });

    // Tabla de detalle
    const tabla = document.getElementById('tablaUsuariosReporte');
    tabla.innerHTML = '';
    detalle.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.usuario_id}</td>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>${u.fecha_registro}</td>
        <td>${u.last_login || '—'}</td>
      `;
      tabla.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al obtener estadísticas de usuarios:', err);
    alert('Error al generar el reporte de usuarios.');
  }
}

document.getElementById('btnFiltrarUsuarios')
        .addEventListener('click', generarReporteUsuarios);


async function generarReporteProductos() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/productos/reporte/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener reporte de productos');

    const productos = data.productos;
    const tabla = document.getElementById('tablaReporteProductos');
    tabla.innerHTML = '';

    productos.forEach(p => {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${p.producto_id}</td>
    <td>${p.nombre}</td>
    <td>${p.stock}</td>
    <td>$${p.precio}</td>
    <td>${p.estado || 'No definido'}</td>
    <td>${p.admin_nombre ? `${p.admin_nombre} ${p.admin_apellido}` : '—'}</td>
    <td>${p.ultima_modificacion}</td>
  `;
  tabla.appendChild(fila);
}); 
  } catch (err) {
    console.error('Error al obtener reporte de productos:', err);
    alert('Error al generar el reporte de productos.');
  }
}

document.getElementById('btnGenerarReporteProductos')
        .addEventListener('click', generarReporteProductos);
