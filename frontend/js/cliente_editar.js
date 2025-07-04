document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = '../pages/login.html';

  try {
    const res = await fetch('/api/auth/verificar', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok || Number(data.usuario.id_rol) !== 1) {
      return window.location.href = '../pages/login.html';
    }

    // Cargar datos del usuario en los campos del formulario
    document.getElementById('nombre').value = data.usuario.nombre || '';
    document.getElementById('apellido').value = data.usuario.apellido || '';
    document.getElementById('correo').value = data.usuario.correo || '';
    document.getElementById('telefono').value = data.usuario.telefono || '';
    document.getElementById('direccion').value = data.usuario.direccion || '';
  } catch (err) {
    console.error('Error de verificación:', err);
    return window.location.href = '../pages/login.html';
  }

  document.getElementById('formEditarPerfil').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;

    try {
      const res = await fetch('/api/usuarios/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, apellido, correo, telefono, direccion })
      });

      const result = await res.json();
      alert(result.message || 'Perfil actualizado');
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Hubo un error al actualizar el perfil');
    }
  });

  document.getElementById('cancelarBtn').addEventListener('click', () => {
    window.location.href = './cliente_inicio.html';
  });
});