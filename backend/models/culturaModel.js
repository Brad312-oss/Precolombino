import { pool } from '../config/db.js';

export const obtenerCulturas = async () => {
  const [rows] = await pool.query('SELECT * FROM cultura');
  return rows;
};

export const insertarCultura = async (cultura) => {
  await pool.query('INSERT INTO cultura (cultura) VALUES (?)', [cultura]);
};

export const borrarCulturaPorId = async (id) => {
  const [resultado] = await pool.query('DELETE FROM cultura WHERE cultura_id = ?', [id]);
  return resultado;
};