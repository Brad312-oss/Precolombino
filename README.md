📦 3. Reporte de Productos
Objetivo:
Visualizar stock, desempeño de productos y disponibilidad.

Contenido sugerido:
Campo	Descripción
ID Producto	Clave del producto
Nombre	Nombre del producto
Cultura	Cultura asociada
Pieza	Pieza asociada
Tamaño	Tamaño del producto
Precio	Precio unitario
Stock disponible	Inventario actual
Vendidos (opcional)	Total vendidos (si lo calculas desde ventas)
Estado	Activo / Inactivo (si manejas esto)

🎯 Extras útiles (si te animas a implementar más adelante):
Exportar los reportes como PDF o Excel.

Graficar (ej: ventas por mes, productos más vendidos).

Reporte comparativo mensual o por rango de fechas.






Izquierda o derecha ? Creerán que me se los de la derecha pero ninguno de la izquierda ? 
Columna izquierda
- **Kobato Hasegawa** (*Boku wa Tomodachi ga Sukunai*)
- **Yoshi** (*Don't Toy with Me, Miss Nagatoro*)
- **Kyouko Hori** (*Horimiya*)
- **Turks Niguredo** (*[Character to be confirmed]*)
- **Marin Kitagawa** (*My Dress-Up Darling*)
Columnmna derecha 
- **Airi Akitsuki** (*Oni Chichi*)
- **Rumi** (*Oyakodon: Oppai Tokumori Bonyuu Tsuyudaku de*)
- **Ayane Shirakawa** (*Overflow*)
- **Yariko** (*JK Bitch ni Shiboraretai*)
- **Aika** (*Ane wa Yanmama Junyuu-chuu*)
🤑🤑🤑🤑🤑🤑🤑 ya los
Vi mugres nomas vienen a lo bueno 
Oni chichi Online
Oyakodon: Oppai Tokumori Bonyuu Tsuyudaku de
Overflow
JK Bitch ni Shiboraretai
Ane wa Yanmama Junyuu-chuu










🧩 2. Frontend HTML
Agrega campos de fechas y un botón para filtrar (en admin_gestion_reportes.html):

html
Copiar
Editar
<div id="filtrosUsuarios">
  <label>Desde: <input type="date" id="fechaInicioUsuarios"></label>
  <label>Hasta: <input type="date" id="fechaFinUsuarios"></label>
  <button id="btnFiltrarUsuarios">Generar Estadísticas</button>
</div>

<div id="resultadoEstadisticasUsuarios">
  <p>👤 Nuevos usuarios registrados: <span id="nuevosUsuarios"></span></p>
  <p>⛔ Usuarios baneados: <span id="baneadosUsuarios"></span></p>
</div>
🧠 3. JS: lógica para obtener los datos
📄 En admin_gestion_reportes.js:

js
Copiar
Editar
document.getElementById('btnFiltrarUsuarios').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  const fechaInicio = document.getElementById('fechaInicioUsuarios').value;
  const fechaFin = document.getElementById('fechaFinUsuarios').value;

  if (!fechaInicio || !fechaFin) {
    alert('Selecciona un rango de fechas.');
    return;
  }

  try {
    const res = await fetch(`/api/usuarios/reporte/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    document.getElementById('nuevosUsuarios').textContent = data.totalNuevos;
    document.getElementById('baneadosUsuarios').textContent = data.totalBaneados;
  } catch (error) {
    console.error('Error cargando estadísticas de usuarios:', error);
    alert('No se pudo obtener el reporte.');
  }
});









4. Registrar la ruta
js
Copiar
Editar
// routes/usuarioRoutes.js
import { obtenerEstadisticasUsuarios } from '../controllers/usuarioController.js';

router.get(
  '/reporte/usuarios',
  verificarUsuario,
  autorizarRoles([3]),
  obtenerEstadisticasUsuarios
);
5. Frontend: HTML y JS
HTML (admin_gestion_reportes.html)
html
Copiar
Editar
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reporte de Usuarios - Admin</title>
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <header>
    <h1>Reporte de Usuarios</h1>
    <button id="logoutBtn">Cerrar sesión</button>
  </header>

  <section class="filtros">
    <label>Desde: <input type="date" id="fechaInicio"></label>
    <label>Hasta: <input type="date" id="fechaFin"></label>
    <button id="btnFiltrarUsuarios">Generar Reporte</button>
  </section>

  <section id="resumenUsuarios">
    <!-- Aquí se pintarán los resúmenes -->
  </section>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Rol</th>
        <th>Estado</th>
        <th>Registro</th>
        <th>Último Login</th>
      </tr>
    </thead>
    <tbody id="tablaUsuariosReporte"></tbody>
  </table>

  <script src="../js/admin_gestion_reportes.js"></script>
</body>
</html>
JS (admin_gestion_reportes.js)
js
Copiar
Editar
async function generarReporteUsuarios() {
  const token = localStorage.getItem('token');
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin    = document.getElementById('fechaFin').value;
  const params = new URLSearchParams({ fechaInicio, fechaFin });

  const res = await fetch(`/api/usuarios/reporte/usuarios?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { resumen, detalle } = await res.json();

  // Pintamos resumen
  const cont = document.getElementById('resumenUsuarios');
  cont.innerHTML = `
    <p><strong>Usuarios nuevos:</strong> ${resumen.total_nuevos}</p>
    <p><strong>Usuarios baneados:</strong> ${resumen.total_baneados}</p>
    <p><strong>Por rol:</strong> ${resumen.porRol.map(r=>`${r.rol}: ${r.cantidad}`).join(' | ')}</p>
  `;

  // Pintamos detalle
  const tbody = document.getElementById('tablaUsuariosReporte');
  tbody.innerHTML = '';
  detalle.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.usuario_id}</td>
      <td>${u.nombre} ${u.apellido}</td>
      <td>${u.correo}</td>
      <td>${u.rol}</td>
      <td>${u.estado}</td>
      <td>${u.fecha_registro}</td>
      <td>${u.last_login || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Inicialización
document.getElementById('btnFiltrarUsuarios')
        .addEventListener('click', generarReporteUsuarios);

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('/index.html');
});
Con esto tendrás un reporte de usuarios que responde a la pregunta:

¿Cuántos usuarios nuevos? (total_nuevos)

¿Cuántos baneados? (total_baneados)

Desglose por rol (porRol)

Detalle de cada usuario con su rol y su last_login (frecuencia de visitas aproximada).







export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  const usuario = await buscarUsuarioPorCorreo(correo);
  const credencialesValidas = usuario && await bcrypt.compare(contraseña, usuario.contraseña);

  if (!credencialesValidas) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  if (usuario.estado === 'baneado') {
    return res.status(403).json({ message: 'Usuario baneado. Acceso denegado.' });
  }

  // ✅ Generar token JWT
  const token = jwt.sign(
    { id: usuario.usuario_id, correo: usuario.correo, id_rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    token,
    usuario: {
      usuario_id: usuario.usuario_id,
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo
    }
  });
};