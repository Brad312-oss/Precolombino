// frontend/js/venta.js

// Esta función se encarga de verificar si hay stock suficiente antes de realizar una venta\async function verificarStock(producto_id, cantidadSolicitada) {
  try {
    const res = await fetch(`http://localhost:3000/api/productos/stock/${producto_id}`);
    const data = await res.json();

    if (data.stock < cantidadSolicitada) {
      alert(`Stock insuficiente. Solo hay ${data.stock} unidades disponibles.`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error al verificar stock:', err);
    alert('No se pudo verificar el stock. Intenta más tarde.');
    return false;
  }

// Esta función registra la venta si todos los productos tienen stock
async function registrarVenta(usuario_id, productos) {
  for (const p of productos) {
    const disponible = await verificarStock(p.producto_id, p.cantidad);
    if (!disponible) return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario_id, productos })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Error al registrar la venta');
      return;
    }

    alert('Venta registrada exitosamente.');
  } catch (err) {
    console.error('Error al registrar la venta:', err);
    alert('No se pudo registrar la venta. Intenta más tarde.');
  }
}

// Ejemplo de uso:
// const usuario_id = 1;
// const productos = [
//   { producto_id: 5, cantidad: 2 },
//   { producto_id: 3, cantidad: 1 }
// ];
// registrarVenta(usuario_id, productos);
