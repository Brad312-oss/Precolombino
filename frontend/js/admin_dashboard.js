document.addEventListener('DOMContentLoaded', () => {
  const usuarioRaw = localStorage.getItem('usuario');
  if (!usuarioRaw) {
    window.location.replace('/index.html');
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  if (!usuario || Number(usuario.id_rol) !== 3) {
    window.location.replace('/index.html');
    return;
  }

  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');
  const saludo = document.getElementById('saludo');

  if (nombre && apellido && saludo) {
    saludo.textContent = `Bienvenido, ${nombre} ${apellido}`;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.replace('/index.html');
  });
});
