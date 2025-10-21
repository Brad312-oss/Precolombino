

  } catch (error) {
    // Mostramos el error en consola y devolvemos un mensaje genérico al cliente
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

// Controlador para crear una nueva reseña de un producto
export const crearResena = async (req, res) => {
  // Extraemos el ID del producto y el comentario desde el cuerpo del request
  const { producto_id, comentario } = req.body;

  // Obtenemos el ID del usuario autenticado desde el token (middleware de autenticación)
  const usuario_id = req.usuario.id;

  try {
    // Insertamos una nueva reseña en la base de datos con la fecha actual (NOW())
    await pool.query(
      'INSERT INTO resenas (producto_id, usuario_id, comentario, fecha) VALUES (?, ?, ?, NOW())',
      [producto_id, usuario_id, comentario]
    );

    // Respondemos al cliente indicando que la reseña fue guardada correctamente
    res.json({ message: 'Reseña enviada correctamente' });
  } catch (error) {
    // Mostramos el error en consola y respondemos con error al cliente
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error al crear reseña' });
  }
};
