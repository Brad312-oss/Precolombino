import {
  obtenerPiezas,
  insertarPieza,
  borrarPiezaPorId
} from '../models/piezaModel.js';

export const listarPiezas = async (req, res) => {
  try {
    const rows = await obtenerPiezas();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener piezas:', error);
    res.status(500).json({ message: 'Error al obtener piezas' });
  }
};

export const crearPieza = async (req, res) => {
  const { nombre_pieza } = req.body;

  if (!nombre_pieza) {
    return res.status(400).json({ message: 'El nombre de la pieza es obligatorio' });
  }

  try {
    await insertarPieza(nombre_pieza);
    res.json({ message: 'Pieza creada correctamente' });
  } catch (error) {
    console.error('Error al crear pieza:', error);
    res.status(500).json({ message: 'Error al crear pieza' });
  }
};

export const eliminarPieza = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await borrarPiezaPorId(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Pieza no encontrada' });
    }

    res.json({ message: 'Pieza eliminada correctamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar la pieza porque está asociada a productos' });
    }

    console.error('Error al eliminar pieza:', error);
    res.status(500).json({ message: 'Error al eliminar pieza' });
  }
};