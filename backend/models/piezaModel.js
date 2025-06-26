import { pool } from '../config/db.js';

export const obtenerPiezas = async () => {
  const [rows] = await pool.query('SELECT * FROM piezas');
  return rows;
};

export const insertarPieza = async (nombre_pieza) => {
  await pool.query('INSERT INTO piezas (nombre_pieza) VALUES (?)', [nombre_pieza]);
};

export const borrarPiezaPorId = async (id) => {
  const [resultado] = await pool.query('DELETE FROM piezas WHERE piezas_id = ?', [id]);
  return resultado;
};