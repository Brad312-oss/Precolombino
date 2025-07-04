const usuarioActualId = JSON.parse(localStorage.getItem('usuario'))?.usuario_id;

document.addEventListener('DOMContentLoaded', () => {
  verificarAdmin();
  listarUsuarios();
  document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(base64);
  } catch (e) {
    return null;
  }
}

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

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = usuario.usuario_id;
      tr.appendChild(tdId);
      
      // Cédula
      const tdCedula = document.createElement('td');
      tdCedula.textContent = usuario.cedula || 'N/A';
      tr.appendChild(tdCedula);
      
      // Nombre
      const tdNombre = document.createElement('td');
      tdNombre.textContent = `${usuario.nombre} ${usuario.apellido}`;
      tr.appendChild(tdNombre);
      
      // Correo
      const tdCorreo = document.createElement('td');
      tdCorreo.textContent = usuario.correo;
      tr.appendChild(tdCorreo);
      
      // Rol
      const tdRol = document.createElement('td');
      tdRol.textContent = usuario.nombre_rol;
      tr.appendChild(tdRol);
      
      // Estado
      const tdEstado = document.createElement('td');
      tdEstado.textContent = usuario.estado === 'activo' ? 'Activo' : 'Baneado';
      tr.appendChild(tdEstado);
      
      // Acciones
      const acciones = document.createElement('td');
      
      // Agrega todos los botones igual que antes...
      // // (btnEditar, btnEliminar, btnBanear/Desbanear, btnCorreo, Hacer/Quitar Admin)

      tr.appendChild(acciones);

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

      const token = parseJwt(localStorage.getItem('token'));
      
      if (usuario.id_rol === 3) {
        // Ya es admin
        const token = parseJwt(localStorage.getItem('token'));
        const btnQuitarAdmin = document.createElement('button');
        btnQuitarAdmin.textContent = 'Quitar Admin';
        
        if (token.id !== usuario.usuario_id) {
          btnQuitarAdmin.onclick = () => quitarRolAdmin(usuario.usuario_id);
        } else {
          btnQuitarAdmin.disabled = true;
          btnQuitarAdmin.title = "No puedes quitarte tu propio rol";
        }
        
        acciones.appendChild(btnQuitarAdmin);
      
      } else {
        
        // No es admin
        const btnHacerAdmin = document.createElement('button');
        btnHacerAdmin.textContent = 'Hacer Admin';
        btnHacerAdmin.onclick = () => cambiarRolAdmin(usuario.usuario_id);
        acciones.appendChild(btnHacerAdmin);
      }

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

async function cambiarRolAdmin(id) {
  if (!confirm('¿Deseas convertir este usuario en administrador?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/cambiar-rol`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nuevo_rol: 3
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert('Rol actualizado a Administrador');
    listarUsuarios();

    if (id === usuarioActualId) {
      const actualizado = JSON.parse(localStorage.getItem('usuario'));
      actualizado.id_rol = 3;
      localStorage.setItem('usuario', JSON.stringify(actualizado));
    }

  } catch (err) {
    console.error(err);
    alert('No se pudo cambiar el rol del usuario');
  }
}

async function quitarRolAdmin(id) {
  if (id === usuarioActualId) {
    alert('No puedes quitarte tu propio rol de administrador.');
    return;
  }

  if (!confirm('¿Deseas quitar el rol de administrador a este usuario?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/cambiar-rol`, {
      method: 'PUT',
      headers: getTokenHeaders(),
      body: JSON.stringify({
        usuario_id: id,
        nuevo_rol: 1 // Cliente
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert('Rol de administrador eliminado. Ahora es cliente.');
    listarUsuarios();

    if (id === usuarioActualId) {
      const actualizado = JSON.parse(localStorage.getItem('usuario'));
      actualizado.id_rol = 1;
      localStorage.setItem('usuario', JSON.stringify(actualizado));
    }

  } catch (err) {
    console.error(err);
    alert('No se pudo cambiar el rol del usuario');
  }
}