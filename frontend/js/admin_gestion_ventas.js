document.addEventListener('DOMContentLoaded', async () => {
  verificarAdmin();
  listarVentas();
  cargarClientes();
  agregarFilaProducto();
  document.getElementById('formRegistrarVenta').addEventListener('submit', registrarVenta);
  document.getElementById('agregarProducto').addEventListener('click', agregarFilaProducto);
});

function getTokenHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

async function verificarAdmin() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/verificar', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    if (!res.ok) throw new Error('Token inválido o expirado');

    const data = await res.json();
    console.log('Usuario verificado:', data);

    if (data.usuario.id_rol !== 3) {
      alert('Acceso denegado');
      window.location.href = '/pages/login.html';
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    alert('Sesión inválida');
    window.location.href = '/pages/login.html';
    return false;
  }
}

async function listarVentas() {
  try {
    const res = await fetch('http://localhost:3000/api/ventas/detalles', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener ventas');

    const tbody = document.getElementById('tablaVentas');
    tbody.innerHTML = '';

    data.forEach(venta => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${venta.venta_id}</td>
        <td>${venta.nombre_cliente}</td>
        <td>${venta.fecha}</td>
        <td>${venta.estado}</td>
        <td>${venta.total}</td>
        <td>
          <button onclick="verDetalleVenta(${venta.venta_id})">Ver Detalle</button>
          <button onclick="mostrarFormularioEstado(${venta.venta_id}, '${venta.estado}')">Actualizar Estado</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar las ventas');
  }
}

async function verDetalleVenta(venta_id) {
  try {
    const res = await fetch(`http://localhost:3000/api/ventas/detalles?id=${venta_id}`, {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    let detalle = 'Productos:\n';
    data.forEach(item => {
      detalle += `- ${item.nombre_producto} (x${item.cantidad}) - $${item.subtotal}\n`;
    });

    alert(detalle);
  } catch (err) {
    console.error(err);
    alert('Error al obtener detalle de venta');
  }
}

function mostrarFormularioEstado(venta_id, estadoActual) {
  const nuevoEstado = prompt(`Estado actual: ${estadoActual}\n\nIngrese el nuevo estado (en proceso / entregada / cancelada):`);
  if (nuevoEstado && ['en proceso', 'entregada', 'cancelada'].includes(nuevoEstado)) {
    actualizarEstadoVenta(venta_id, nuevoEstado);
  } else {
    alert('Estado inválido o cancelado');
  }
}

async function actualizarEstadoVenta(venta_id, nuevoEstado) {
  try {
    const res = await fetch(`http://localhost:3000/api/ventas/actualizar-estado/${venta_id}`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Estado actualizado correctamente');
    listarVentas();
  } catch (err) {
    console.error(err);
    alert('Error al actualizar el estado');
  }
}

async function registrarVenta(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const usuario_id = document.getElementById('clienteSelect').value;
  const fecha = new Date().toISOString().split('T')[0];
  let total = 0;

  const filas = document.querySelectorAll('#productosVenta tbody tr');
  const productos = [];

  filas.forEach(fila => {
    const producto_id = fila.querySelector('.productoSelect').value;
    const cantidad = parseInt(fila.querySelector('.cantidad').value);
    const precio = parseFloat(fila.querySelector('.precio').textContent);

    if (cantidad > 0) {
      const subtotal = cantidad * precio;
      total += subtotal;
      productos.push({ producto_id, cantidad, subtotal });
    }
  });

  if (productos.length === 0) return alert('Agrega al menos un producto.');

  try {
    const res = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ usuario_id, fecha, total, productos })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Venta registrada correctamente');
      listarVentas();
      document.getElementById('formRegistrarVenta').reset();
      document.querySelector('#productosVenta tbody').innerHTML = '';
      document.getElementById('totalVenta').textContent = '0.00';
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión al registrar venta');
  }
}

async function cargarClientes() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/usuarios/clientes', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const clientes = await res.json();
    const select = document.getElementById('clienteSelect');
    select.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.usuario_id;
      option.textContent = `${cliente.nombre} ${cliente.apellido}`;
      clienteSelect.appendChild(option);
    });

  } catch (err) {
    console.error('Error al cargar clientes:', err);
  }
}

function agregarFilaProducto() {
  const tbody = document.querySelector('#productosVenta tbody');

  const tr = document.createElement('tr');

  tr.innerHTML = `
  <td>
    <select class="productoSelect"></select>
  </td>
  <td>
    <input type="number" class="cantidad" min="1" value="1">
  </td>
  <td class="precio">0</td>
  <td class="subtotal">0</td>
  <td><button type="button" class="eliminarFila">🗑️</button></td>
`;

  tbody.appendChild(tr);

  cargarOpcionesProducto(tr.querySelector('.productoSelect'));

  tr.querySelector('.eliminarFila').addEventListener('click', () => {
  tr.remove();
  actualizarTotalVenta();
});
}

async function cargarOpcionesProducto(selectElement) {
  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      headers: getTokenHeaders()
    });
    const productos = await res.json();

    selectElement.innerHTML = '<option value="">Seleccione un producto</option>';

    productos.forEach(producto => {
      const option = document.createElement('option');
      option.value = producto.producto_id;
      option.textContent = `${producto.nombre_pieza} - ${producto.cultura} - ${producto.tamanio} ($${producto.precio})`;
      option.dataset.precio = producto.precio;
      selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', actualizarSubtotal);
    selectElement.closest('tr').querySelector('.cantidad').addEventListener('input', actualizarSubtotal);

    function actualizarSubtotal() {
      const fila = selectElement.closest('tr');
      const precio = parseFloat(selectElement.selectedOptions[0].dataset.precio || 0);
      const cantidad = parseInt(fila.querySelector('.cantidad').value || 0);
      const subtotal = precio * cantidad;

      fila.querySelector('.precio').textContent = precio.toFixed(2);
      fila.querySelector('.subtotal').textContent = subtotal.toFixed(2);

      actualizarTotalVenta();
    }

  } catch (err) {
    console.error('Error al cargar opciones de productos:', err);
  }
}

function actualizarTotalVenta() {
  let total = 0;
  document.querySelectorAll('.subtotal').forEach(cell => {
    total += parseFloat(cell.textContent || 0);
  });
  document.getElementById('totalVenta').textContent = total.toFixed(2);
}
