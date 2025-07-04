const token = localStorage.getItem('token');
if (!token) window.location.href = '../pages/login.html'; 

const carrito = [];
let catalogoProductos = [];

document.addEventListener('DOMContentLoaded', cargarCatalogo);

async function cargarCatalogo() {
  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const productos = await res.json();
    catalogoProductos = productos;
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = '';

    productos.forEach(prod => {
      const card = document.createElement('div');
      card.classList.add('producto-card');

      card.innerHTML = `
        <img src="http://localhost:3000${prod.imagen}" alt="${prod.descripcion}">
        <p><strong>Cultura:</strong> ${prod.cultura}</p>
        <p><strong>Pieza:</strong> ${prod.pieza}</p>
        <p><strong>Tamaño:</strong> ${prod.tamanio}</p>
        <p><strong>Precio:</strong> $${prod.precio}</p>
        <p><strong>Stock:</strong> ${prod.stock}</p>

        <label for="cantidad-${prod.producto_id}">Cantidad:</label>
        <input type="number" min="1" max="${prod.stock}" value="1" id="cantidad-${prod.producto_id}">

        <button onclick="verDetalle(${prod.producto_id})">Ver Detalle</button>
        <button onclick="agregarAlCarrito(${prod.producto_id})">Agregar al carrito</button>
      `;

      contenedor.appendChild(card);
    });

    actualizarTotalCarrito();

  } catch (err) {
    console.error('Error cargando productos', err);
  }
}

window.verDetalle = async function(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const prod = await res.json();

    const detalleHTML = `
      <div class="detalle-modal">
        <h3>${prod.nombre_pieza} - ${prod.cultura} - ${prod.tamanio}</h3>
        <img src="http://localhost:3000${prod.imagen}" alt="${prod.descripcion}">
        <p><strong>Descripción:</strong> ${prod.descripcion}</p>
        <p><strong>Precio:</strong> $${prod.precio}</p>
        <p><strong>Stock:</strong> ${prod.stock}</p>
        <button onclick="cerrarDetalle()">Cerrar</button>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'modalDetalle';
    modal.classList.add('modal');
    modal.innerHTML = detalleHTML;
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error al obtener detalle:', error);
  }
};

window.cerrarDetalle = function() {
  const modal = document.getElementById('modalDetalle');
  if (modal) modal.remove();
};

window.agregarAlCarrito = function(producto_id) {
  const inputCantidad = document.getElementById(`cantidad-${producto_id}`);
  const cantidad = parseInt(inputCantidad.value);

  if (isNaN(cantidad) || cantidad < 1) {
    return alert('Cantidad inválida.');
  }

  const producto = catalogoProductos.find(p => p.producto_id === producto_id);
  if (!producto) return alert('Producto no encontrado.');

  const existente = carrito.find(p => p.producto_id === producto_id);
  const cantidadDeseada = existente ? existente.cantidad + cantidad : cantidad;

  if (cantidadDeseada > producto.stock) {
    return alert(`Stock insuficiente para "${producto.nombre_pieza}". Disponible: ${producto.stock}, solicitando: ${cantidadDeseada}`);
  }

  const subtotal = cantidad * producto.precio;

  if (existente) {
    existente.cantidad += cantidad;
    existente.subtotal += subtotal;
  } else {
    carrito.push({
      producto_id,
      cantidad,
      subtotal,
      nombre_pieza: producto.nombre_pieza,
      cultura: producto.cultura,
      tamanio: producto.tamanio,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  alert('Producto agregado al carrito.');
  actualizarTotalCarrito();
};

function actualizarTotalCarrito() {
  const total = carrito.reduce((acc, p) => acc + p.subtotal, 0);
  const totalSpan = document.getElementById('total-carrito');
  if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

document.getElementById('comprarBtn').addEventListener('click', confirmarCompra);

async function confirmarCompra() {
  if (carrito.length === 0) {
    return alert('Tu carrito está vacío.');
  }

  const tipoPago = document.getElementById('tipoPago').value;
  if (!tipoPago) return alert('Debes seleccionar un tipo de pago.');

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const usuario_id = Number(tokenPayload.id);
  const total = carrito.reduce((acc, p) => acc + p.subtotal, 0);
  const fecha = new Date().toISOString().slice(0, 10);

  try {
    const res = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        usuario_id,
        fecha,
        total,
        tipo_pago: tipoPago,
        productos: carrito
      })
    });

    const data = await res.json();

    if (res.ok) {
  alert('Compra realizada con éxito. Gracias por tu pago con ' + tipoPago);

  const productosComprados = [...carrito];
  carrito.length = 0;
  cargarCatalogo();
  
  mostrarRecibo({
    fecha,
    total,
    tipo_pago: tipoPago,
    productos: productosComprados
  });
}
else {
      alert(data.message || 'Error al procesar la compra.');
    }
  } catch (err) {
    console.error('Error al confirmar compra:', err);
  }
}
console.log('Detalle completo recibido:', data);
function mostrarRecibo(detalleCompra) {
  const reciboWindow = window.open('', 'Recibo', 'width=600,height=600');
  let html = `<h2>Recibo de Compra</h2>`;
  html += `<p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>`;
  html += `<p><strong>Tipo de Pago:</strong> ${detalleCompra.tipo_pago}</p>`;
  html += `<table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Pieza</th>
      <th>Cultura</th>
      <th>Tamaño</th>
      <th>Precio Unitario</th>
      <th>Cantidad</th>
      <th>Subtotal</th>
    </tr>`;

  detalleCompra.productos.forEach(producto => {
  console.log(producto.cultura, producto.tamanio);
    const precio = parseFloat(producto.precio) || 0;
    const cantidad = parseInt(producto.cantidad) || 0;
    const subtotalCalculado = producto.subtotal ?? (precio * cantidad);
    const subtotalFixed = subtotalCalculado.toFixed(2);

    html += `<tr>
      <td>${producto.nombre_pieza}</td>
      <td>${producto.cultura}</td>
      <td>${producto.tamanio}</td>
      <td>$${precio.toFixed(2)}</td>
      <td>${cantidad}</td>
      <td>$${subtotalFixed}</td>
    </tr>`;
  });

  html += `</table>`;
  html += `<h3>Total: $${parseFloat(detalleCompra.total).toFixed(2)}</h3>`;
  reciboWindow.document.body.innerHTML = html;
}