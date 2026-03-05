import { Router, Request, Response } from 'express';
import pool from '../db';
import { ApiResponse } from '../types';
import { query } from 'winston';

const router = Router();

/**
 * GET /grados
 * Query params:
 *   - title     : filtrar por nombre del grado (búsqueda parcial, case-insensitive)
 *   - location  : filtrar por localidad (búsqueda parcial, case-insensitive)
 *   - cutOff    : nota de corte máxima — devuelve grados con cutOff <= este valor
 */
router.get('/', async (req: Request, res: Response) => {
  const { title, location, cutOff } = req.query;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (title) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${title}%`);
    paramIndex++;
  }

  if (location) {
    conditions.push(`location ILIKE $${paramIndex}`);
    values.push(`%${location}%`);
    paramIndex++;
  }

  if (cutOff) {
    const cutOffNum = parseFloat(cutOff as string);
    if (!isNaN(cutOffNum)) {
      conditions.push(`"cutOff" <= $${paramIndex}`);
      values.push(cutOffNum);
      paramIndex++;
    }
  }


  let finalQuery;

  if(conditions.length === 0) {
    finalQuery = `SELECT id, title, location, university, "cutOff" FROM "Grados" ORDER BY "cutOff" DESC LIMIT 10`;
  } else 
  {
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    finalQuery = `SELECT id, title, location, university, "cutOff" FROM "Grados" ${whereClause} ORDER BY "cutOff" DESC`;
  }

  try {
    const result = await pool.query(finalQuery, values);

    const response: ApiResponse = {
      success: true,
      data: result.rows,
      message: `${result.rowCount} grados encontrados`,
    };

    res.json(response);
  } catch (err) {
    console.error('Error querying Grados:', err);
    res.status(500).json({
      success: false,
      message: 'Error al consultar los grados',
    });
  }
});

/**
 * GET /grados/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, title, location, university, "cutOff" FROM "Grados" WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grado no encontrado',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: result.rows[0],
      message: 'Grado encontrado correctamente',
    };

    res.json(response);
  } catch (err) {
    console.error('Error querying Grado by id:', err);
    res.status(500).json({
      success: false,
      message: 'Error al consultar el grado',
    });
  }
});

export default router;
