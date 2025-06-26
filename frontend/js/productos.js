let carrito = [];
let total = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('productos');
  const res = await fetch('http://localhost:3000/api/productos');
  const productos = await res.json();

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h4>${producto.nombre_pieza} (${producto.cultura})</h4>
      <p>Tamaño: ${producto.tamanio} | Precio: $${producto.precio}</p>
      <input type="number" min="0" placeholder="Cantidad" id="cant-${producto.producto_id}">
      <button onclick="agregarAlCarrito(${producto.producto_id}, ${producto.precio})">Agregar</button>
      <hr>
    `;
    contenedor.appendChild(div);
  });
});

function agregarAlCarrito(id, precio) {
  const cantidad = parseInt(document.getElementById(`cant-${id}`).value);
  if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

  const existe = carrito.find(item => item.producto_id === id);
  if (existe) {
    existe.cantidad += cantidad;
    existe.subtotal += cantidad * precio;
  } else {
    carrito.push({ producto_id: id, cantidad, subtotal: cantidad * precio });
  }

  total += cantidad * precio;
  document.getElementById('total').textContent = total.toFixed(2);
}

document.getElementById('comprarBtn').addEventListener('click', async () => {
  console.log('Usuario logueado:', usuarioId); // Asegúrate de guardar esto en login
  const usuarioId = localStorage.getItem('usuario_id');
  if (!usuarioId) return alert("Inicia sesión");

  const data = {
    usuario_id: parseInt(usuario_id),
    fecha: new Date().toISOString().split('T')[0],
    total,
    productos: carrito
  };

  const res = await fetch('http://localhost:3000/api/ventas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
  if (res.status === 201) {
    carrito = [];
    total = 0;
    document.getElementById('total').textContent = '0.00';
  }
});