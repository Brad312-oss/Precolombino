document.addEventListener('DOMContentLoaded', () => {
  verificarAdmin();
  listarUsuarios();
  document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

function getTokenHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function verificarAdmin() {
  const usuarioRaw = localStorage.getItem('usuario');
  if (!usuarioRaw) return location.href = '/index.html';

  const usuario = JSON.parse(usuarioRaw);
  if (usuario.id_rol !== 3) return location.href = '/index.html';
}

async function listarUsuarios() {
  try {
    const res = await fetch('http://localhost:3000/api/usuarios/listar', {
      method: 'GET',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener usuarios');

    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = '';

    data.forEach(usuario => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${usuario.usuario_id}</td>
        <td>${usuario.cedula || 'N/A'}</td>
        <td>${usuario.nombre} ${usuario.apellido}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.nombre_rol}</td>
        <td>${usuario.estado === 'activo' ? 'Activo' : 'Baneado'}</td>
      `;

      const acciones = document.createElement('td');

      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.onclick = () => editarUsuario(usuario.usuario_id);
      acciones.appendChild(btnEditar);

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.onclick = () => eliminarUsuario(usuario.usuario_id);
      acciones.appendChild(btnEliminar);

      if (usuario.estado === 'baneado') {
        const btnDesbanear = document.createElement('button');
        btnDesbanear.textContent = 'Desbanear';
        btnDesbanear.onclick = () => desbanearUsuario(usuario.usuario_id);
        acciones.appendChild(btnDesbanear);
      } else {
        const btnBanear = document.createElement('button');
        btnBanear.textContent = 'Banear';
        btnBanear.onclick = () => banearUsuario(usuario.usuario_id);
        acciones.appendChild(btnBanear);
      }

      const btnCorreo = document.createElement('button');
      btnCorreo.textContent = 'Correo';
      btnCorreo.onclick = () => enviarCorreo(usuario.correo);
      acciones.appendChild(btnCorreo);

      tr.appendChild(acciones);
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los usuarios');
  }
}

async function banearUsuario(id) {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioActual.usuario_id === id) {
    return alert('No puedes banearte a ti mismo');
  }

  if (!confirm('¿Estás seguro de banear este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${id}/banear`, {
      method: 'PUT',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al banear');

    alert('Usuario baneado correctamente');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('No se pudo banear al usuario');
  }
}

function enviarCorreo(correo) {
  const asunto = prompt('Asunto del correo:');
  const mensaje = prompt('Mensaje para enviar:');
  if (!asunto || !mensaje) return;

  fetch('http://localhost:3000/api/usuarios/enviar-correo', {
    method: 'POST',
    headers: getTokenHeaders(),
    body: JSON.stringify({ correo, asunto, mensaje })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Correo enviado');
    })
    .catch(err => {
      console.error(err);
      alert('No se pudo enviar el correo');
    });
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  location.href = '/index.html';
}

async function editarUsuario(id) {
  const nombre = prompt('Nuevo nombre:');
  const apellido = prompt('Nuevo apellido:');
  const correo = prompt('Nuevo correo:');
  const telefono = prompt('Teléfono:');
  const direccion = prompt('Dirección:');

  if (!nombre || !apellido || !correo) return alert('Campos obligatorios incompletos');

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/editar', {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nombre,
        apellido,
        correo,
        telefono,
        direccion
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Usuario actualizado');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('Error al editar usuario');
  }
}

async function eliminarUsuario(id) {
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioActual.usuario_id === id) {
    return alert('No puedes eliminarte a ti mismo');
  }

  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/eliminar/${id}`, {
      method: 'DELETE',
      headers: getTokenHeaders()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert('Usuario eliminado correctamente');
    listarUsuarios();
  } catch (err) {
    console.error(err);
    alert('No se pudo eliminar el usuario');
  }
}

async function desbanearUsuario(usuario_id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/desbanear`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ usuario_id })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Usuario desbaneado');
      listarUsuarios(); // recarga lista actualizada
    } else {
      alert(data.message || 'Error al desbanear');
    }
  } catch (error) {
    console.error('Error al desbanear:', error);
  }
}