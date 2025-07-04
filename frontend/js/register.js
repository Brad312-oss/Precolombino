// register.js

const getValue = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento con id="${id}" no encontrado`);
    return el.value;
};

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        try {
            const nombre = getValue('nombre');
            const apellido = getValue('apellido');
            const correo = getValue('correo');
            const cedula = getValue('cedula');
            const telefono = getValue('telefono');
            const direccion = getValue('direccion');
            const fecha_registro = getValue('fecha_registro');
            const contraseña = getValue('contrasena');

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    correo,
                    cedula,
                    telefono,
                    direccion,
                    fecha_registro,
                    contraseña
                })
            });

            const text = await response.text();

            try {
                const data = JSON.parse(text);
                if (response.ok) {
                    alert('Registro exitoso');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Error al registrar');
                }
            } catch (e) {
                console.error('Respuesta inesperada del servidor:', text);
                alert('Error inesperado: la respuesta no es JSON');
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Hubo un problema al conectar con el servidor');
        }
    });
});