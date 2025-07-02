const token = localStorage.getItem('token');
const carrito = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!token) return window.location.href = '/frontend/pages/login.html';
  cargarCatalogo();
});

let catalogoProductos = []; // 🟡 global para tener acceso a los precios

async function cargarCatalogo() {
  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productos = await res.json();
    catalogoProductos = productos; // 🟢 guardar productos con sus precios

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
        <button onclick="verDetalle(${prod.producto_id})">Ver Detalle</button>
        <button onclick="agregarAlCarrito(${prod.producto_id})">Agregar</button>
      `;

      contenedor.appendChild(card);
    });

    // ✅ Agregar botón de compra al final del catálogo
    const btnComprar = document.createElement('button');
    btnComprar.textContent = 'Confirmar compra';
    btnComprar.onclick = confirmarCompra;
    contenedor.appendChild(btnComprar);

  } catch (err) {
    console.error('Error cargando productos', err);
  }
}

// ✅ Función para ver detalle
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

    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent === 'Ver Detalle') btn.disabled = true;
    });

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

  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === 'Ver Detalle') btn.disabled = false;
  });
};

window.agregarAlCarrito = function(idProducto) {
  if (carrito.includes(idProducto)) {
    alert('Ya has agregado este producto.');
    return;
  }

  carrito.push(idProducto);
  alert('Producto agregado al carrito.');
};

async function confirmarCompra() {
  if (carrito.length === 0) {
    return alert('No has seleccionado ningún producto.');
  }

  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const usuario_id = Number(tokenPayload.id);

  let total = 0;
  const productosFormateados = carrito.map(id => {
    const prod = catalogoProductos.find(p => p.producto_id === id);
    const precio = prod ? Number(prod.precio) : 0;
    total += precio;

    return {
      producto_id: Number(id),
      cantidad: 1,
      subtotal: Number(precio)
    };
  });
  total = Number(total.toFixed(2));
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
        productos: productosFormateados
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Compra realizada con éxito');
      carrito.length = 0;
      cargarCatalogo(); // recargar stock
    } else {
      alert(data.message || 'Error al procesar la compra.');
    }
  } catch (err) {
    console.error('Error al confirmar compra:', err);
  }
}
