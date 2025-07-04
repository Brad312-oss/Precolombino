document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contraseña = document.getElementById('contraseña').value;

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Guardar token y datos del usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // ✅ Redirigir según el rol
      const rol = data.usuario.id_rol;
      switch (rol) {
        case 3: // admin
        window.location.href = '/pages/admin_dashboard.html';
        break;
        case 2: // operario
        window.location.href = '/pages/operario.html';
        break;
        case 1: // cliente
        window.location.href = '/pages/cliente_inicio.html';
        break;
        default:
          alert('Rol no reconocido');
        }


    } else {
      alert(data.message || 'Error en el login');
    }

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Error de conexión');
  }
});

// ✅ Manejo de enlace "¿Olvidaste tu contraseña?"
document.addEventListener('DOMContentLoaded', () => {
  const enlace = document.getElementById('olvideContrasena');
  if (enlace) {
    enlace.addEventListener('click', (event) => {
      event.preventDefault();
      const correo = prompt('Ingresa tu correo para recuperar tu contraseña:');
      if (!correo) return;

      fetch('http://localhost:3000/api/auth/solicitar-recuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || 'Revisa tu correo para instrucciones.');
        })
        .catch(err => {
          console.error('Error:', err);
          alert('No se pudo enviar el correo.');
        });
    });
  } else {
    console.warn('El enlace de recuperación no se encontró en el DOM');
  }
});