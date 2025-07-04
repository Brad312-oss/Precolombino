document.addEventListener('DOMContentLoaded', () => {
  function getTokenHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario || Number(usuario.id_rol) !== 3 || !token) {
    alert('Acceso no autorizado. Vuelve a iniciar sesión.');
    localStorage.clear();
    window.location.href = '../index.html';
    return;
  }

  fetch('http://localhost:3000/api/auth/verificar', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Token inválido');
      return res.json();
    })
    .catch(err => {
      console.error('Token inválido o expirado:', err);
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      localStorage.clear();
      window.location.href = '../index.html';
    });

  const piezasSelect = document.getElementById('piezas_id');
  const culturaSelect = document.getElementById('cultura_id');
  const tamanioSelect = document.getElementById('tamanio_id');
  const form = document.getElementById('formProducto');
  const tabla = document.getElementById('tablaProductos');
  const imagenInput = document.getElementById('imagen');
  let editandoId = null;

  const cargarSelect = async (url, select) => {
    const res = await fetch(url, { headers: getTokenHeaders() });
    const datos = await res.json();
    select.innerHTML = '';
    datos.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id || item[Object.keys(item)[0]];
      option.textContent = item.nombre || item[Object.keys(item)[1]];
      select.appendChild(option);
    });
  };

  const listarProductos = async () => {
    const res = await fetch('/api/productos', { headers: getTokenHeaders() });
    const productos = await res.json();
    tabla.innerHTML = '';
    productos.forEach(p => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${p.producto_id}</td>
        <td>${p.nombre_pieza}</td>
        <td>${p.cultura}</td>
        <td>${p.tamanio}</td>
        <td>${p.precio}</td>
        <td>${p.stock}</td>
        <td>
          <button class="editar" data-id="${p.producto_id}">✏️</button>
          <button class="eliminar" data-id="${p.producto_id}">🗑️</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('piezas_id', piezasSelect.value);
    formData.append('cultura_id', culturaSelect.value);
    formData.append('tamanio_id', tamanioSelect.value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('stock', document.getElementById('stock').value);
    formData.append('descripcion', document.getElementById('descripcion').value);

    const archivoImagen = imagenInput.files[0];
    if (!archivoImagen && !editandoId) {
      alert('Debes subir una imagen');
      return;
    }

    if (archivoImagen) {
      formData.append('imagen', archivoImagen);
    }

    const url = editandoId ? `/api/productos/${editandoId}` : '/api/productos';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      alert(result.message || 'Guardado correctamente');
      form.reset();
      imagenInput.value = '';
      editandoId = null;
      listarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto');
    }
  });

  tabla.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('eliminar')) {
      if (!confirm('¿Eliminar producto?')) return;
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: getTokenHeaders()
      });
      const result = await res.json();
      alert(result.message);
      listarProductos();
    }

    if (e.target.classList.contains('editar')) {
      const res = await fetch('/api/productos', {
        headers: getTokenHeaders()
      });
      const productos = await res.json();
      const producto = productos.find(p => p.producto_id == id);

      if (producto) {
        piezasSelect.value = producto.piezas_id;
        culturaSelect.value = producto.cultura_id;
        tamanioSelect.value = producto.tamanio_id;
        document.getElementById('imagen').value = '';
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        editandoId = id;
        window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
      }
    }
  });

  document.getElementById('formPieza').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre_pieza = document.getElementById('nuevaPieza').value.trim();
    if (!nombre_pieza) return alert('Ingresa un nombre válido');
    const res = await fetch('/api/piezas', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre_pieza })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/piezas', piezasSelect);
    listarPiezas();
  });

  const listarPiezas = async () => {
    const tabla = document.getElementById('tablaPiezas');
    const res = await fetch('/api/piezas', { headers: getTokenHeaders() });
    const piezas = await res.json();
    tabla.innerHTML = '';
    piezas.forEach(p => {
      tabla.innerHTML += `
        <tr>
          <td>${p.piezas_id}</td>
          <td>${p.nombre_pieza}</td>
          <td><button class="eliminarPieza" data-id="${p.piezas_id}">🗑️</button></td>
        </tr>`;
    });
  };

  document.getElementById('tablaPiezas').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarPieza')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar pieza?')) {
        const res = await fetch(`/api/piezas/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/piezas', piezasSelect);
        listarPiezas();
      }
    }
  });

  document.getElementById('formTamanio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tamanio = document.getElementById('nuevoTamanio').value.trim();
    if (!tamanio) return alert('Ingresa un tamaño válido');
    const res = await fetch('/api/tamanios', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tamanio })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/tamanios', tamanioSelect);
    listarTamanios();
  });

  const listarTamanios = async () => {
    const tabla = document.getElementById('tablaTamanios');
    const res = await fetch('/api/tamanios', { headers: getTokenHeaders() });
    const tamanios = await res.json();
    tabla.innerHTML = '';
    tamanios.forEach(t => {
      tabla.innerHTML += `
        <tr>
          <td>${t.tamanio_id}</td>
          <td>${t.tamanio}</td>
          <td><button class="eliminarTamanio" data-id="${t.tamanio_id}">🗑️</button></td>
        </tr>`;
    });
  };

  document.getElementById('tablaTamanios').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarTamanio')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar tamaño?')) {
        const res = await fetch(`/api/tamanios/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/tamanios', tamanioSelect);
        listarTamanios();
      }
    }
  });

  document.getElementById('formCultura').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cultura = document.getElementById('nuevaCultura').value.trim();
    if (!cultura) return alert('Ingresa una cultura válida');
    const res = await fetch('/api/culturas', {
      method: 'POST',
      headers: {
        ...getTokenHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cultura })
    });
    const result = await res.json();
    alert(result.message);
    e.target.reset();
    cargarSelect('/api/culturas', culturaSelect);
    listarCulturas();
  });

  const listarCulturas = async () => {
    const tabla = document.getElementById('tablaCulturas');
    const res = await fetch('/api/culturas', { headers: getTokenHeaders() });
    const culturas = await res.json();
    tabla.innerHTML = '';
    culturas.forEach(c => {
      tabla.innerHTML += `
        <tr>
          <td>${c.cultura_id}</td>
          <td>${c.cultura}</td>
          <td><button class="eliminarCultura" data-id="${c.cultura_id}">🗑️</button></td>
        </tr>`;
    });
  };

  document.getElementById('tablaCulturas').addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminarCultura')) {
      const id = e.target.dataset.id;
      if (confirm('¿Eliminar cultura?')) {
        const res = await fetch(`/api/culturas/${id}`, {
          method: 'DELETE',
          headers: getTokenHeaders()
        });
        const result = await res.json();
        alert(result.message);
        cargarSelect('/api/culturas', culturaSelect);
        listarCulturas();
      }
    }
  });

  cargarSelect('/api/piezas', piezasSelect);
  cargarSelect('/api/culturas', culturaSelect);
  cargarSelect('/api/tamanios', tamanioSelect);
  listarProductos();
  listarPiezas();
  listarTamanios();
  listarCulturas();
});