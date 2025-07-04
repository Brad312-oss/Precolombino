document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);

  if (!token) {
    console.log('No hay token, redirigiendo a login');
    return window.location.href = '../pages/login.html';
  }

  try {
    console.log('Enviando verificación...');
    const res = await fetch('/api/auth/verificar', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    console.log('Respuesta verificación:', JSON.stringify(data, null, 2));

    if (!res.ok || Number(data.usuario.id_rol) !== 1) {
      console.log('Rol inválido, redirigiendo');
      return window.location.href = '../pages/login.html';
    }

  } catch (err) {
    console.error('Error en la verificación:', err);
    return window.location.href = '../pages/login.html';
  }

  document.getElementById('verCatalogoBtn').addEventListener('click', () => {
    window.location.href = './cliente_catalogo.html';
  });

  document.getElementById('editarPerfilBtn').addEventListener('click', () => {
    window.location.href = './cliente_editar.html';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../pages/login.html';
  });
});