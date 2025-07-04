document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = '../pages/login.html';

  // Cargar productos para el selector
  const cargarProductos = async () => {
    const res = await fetch('/api/productos');
    const productos = await res.json();
    const select = document.getElementById('producto');
    productos.forEach(p => {
      const nombre = `${p.nombre_pieza} - ${p.cultura} - ${p.tamanio}`;
      const option = document.createElement('option');
      option.value = p.producto_id;
      option.textContent = nombre;
      select.appendChild(option);
    });
  };

  // Cargar reseñas
  const cargarResenas = async () => {
    const res = await fetch('/api/resenas');
    const resenas = await res.json();
    const contenedor = document.getElementById('listaResenas');
    contenedor.innerHTML = '';
    resenas.forEach(r => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${r.nombre}</strong> comentó sobre <em>${r.nombre_producto}</em>:<br>${r.comentario}<hr>`;
      contenedor.appendChild(div);
    });
  };

  // Enviar reseña
  document.getElementById('formResena').addEventListener('submit', async (e) => {
    e.preventDefault();
    const producto_id = document.getElementById('producto').value;
    const comentario = document.getElementById('comentario').value;

    const res = await fetch('/api/resenas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ producto_id, comentario })
    });

    const data = await res.json();
    alert(data.message || 'Reseña enviada');
    document.getElementById('formResena').reset();
    cargarResenas();
  });

  await cargarProductos();
  await cargarResenas();
});