import {
  obtenerTamanios,
  insertarTamanio,
  borrarTamanioPorId
} from '../models/tamanioModel.js';

// Listar todos los tamaños
export const listarTamanios = async (req, res) => {
  try {
    const tamanios = await obtenerTamanios();
    res.json(tamanios);
  } catch (error) {
    console.error('Error al obtener tamaños:', error);
    res.status(500).json({ message: 'Error al obtener tamaños' });
  }
};

// Crear nuevo tamaño
export const crearTamanio = async (req, res) => {
  const { tamanio } = req.body;

  if (!tamanio) {
    return res.status(400).json({ message: 'El tamaño es obligatorio' });
  }

  try {
    await insertarTamanio(tamanio);
    res.json({ message: 'Tamaño agregado correctamente' });
  } catch (error) {
    console.error('Error al crear tamaño:', error);
    res.status(500).json({ message: 'Error al crear tamaño' });
  }
};

// Eliminar tamaño
export const eliminarTamanio = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await borrarTamanioPorId(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Tamaño no encontrado' });
    }

    res.json({ message: 'Tamaño eliminado correctamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar el tamaño porque está asociado a productos' });
    }

    console.error('Error al eliminar tamaño:', error);
    res.status(500).json({ message: 'Error al eliminar tamaño' });
  }
};