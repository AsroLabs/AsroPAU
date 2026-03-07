import { Router, Request, Response } from 'express';
import pool from '../db/index';
import { ApiResponse } from '../types';

const router = Router();

// ---------------------------------------------------------------------------
// GET /exams
// Query params (todos opcionales):
//   localidad    – comunidad autónoma  → filtra por ccaa (ILIKE)
//   asignatura   – una o varias materias separadas por coma → filtra por materia
//   anyo         – año del examen (number) → filtra por anio
//   convocatoria – "Ordinaria" | "Extraordinaria" → filtra por convocatoria
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  const { localidad, asignatura, anyo, convocatoria } = req.query;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (localidad) {
    conditions.push(`ccaa ILIKE $${paramIndex}`);
    values.push(`%${localidad}%`);
    paramIndex++;
  }

  if (anyo) {
    const year = parseInt(anyo as string, 10);
    if (!isNaN(year)) {
      conditions.push(`anio = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }
  }

  if (convocatoria) {
    conditions.push(`convocatoria = $${paramIndex}`);
    values.push(convocatoria as string);
    paramIndex++;
  }

  if (asignatura) {
    const materias = (asignatura as string)
      .split(',')
      .map((s) => `%${s.trim()}%`)
      .filter(Boolean);

    if (materias.length > 0) {
      // materia ILIKE $n OR materia ILIKE $n+1 ...
      const likeConditions = materias.map((_, i) => {
        const ph = `$${paramIndex + i}`;
        return `materia ILIKE ${ph}`;
      });
      conditions.push(`(${likeConditions.join(' OR ')})`);
      values.push(...materias);
      paramIndex += materias.length;
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT id, materia, convocatoria, ccaa, anio
    FROM "Examenes"
    ${whereClause}
    ORDER BY anio DESC, ccaa ASC, materia ASC
  `;

  try {
    const result = await pool.query(query, values);

    // Mapear al shape que espera el frontend
    const data = result.rows.map((row) => ({
      id:      row.id,
      region:  row.ccaa,
      subject: row.materia,
      year:    row.anio,
      session: row.convocatoria,
      type:    row.convocatoria as 'Ordinaria' | 'Extraordinaria',
    }));

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('[GET /exams] DB error:', err);
    res.status(500).json({ success: false, error: 'Error al obtener los exámenes' });
  }
});

// ---------------------------------------------------------------------------
// GET /exams/:id/download
// Busca el link del examen por id y redirige (302) a la URL del ZIP oficial.
// El navegador sigue el redirect y descarga el archivo automáticamente.
// ---------------------------------------------------------------------------
router.get('/:id/download', async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string, 10);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'ID inválido' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT link FROM "Examenes" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Examen no encontrado' });
      return;
    }

    const { link } = result.rows[0];
    res.redirect(302, link);
  } catch (err) {
    console.error('[GET /exams/:id/download] DB error:', err);
    res.status(500).json({ success: false, error: 'Error al obtener el examen' });
  }
});

export default router;
