import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import pool from '../index';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const createExamenesTable = `
  CREATE TABLE IF NOT EXISTS "Examenes" (
    id           SERIAL PRIMARY KEY,
    materia      VARCHAR(255) NOT NULL,
    convocatoria VARCHAR(50)  NOT NULL,
    ccaa         VARCHAR(100) NOT NULL,
    anio         INTEGER      NOT NULL,
    link         TEXT         NOT NULL,
    CONSTRAINT examenes_materia_convocatoria_ccaa_anio_unique
      UNIQUE (materia, convocatoria, ccaa, anio)
  );
`;

// ---------------------------------------------------------------------------
// CSV parser
// Handles RFC-4180 quoted fields without external deps.
// ---------------------------------------------------------------------------
interface ExamenRow {
  materia: string;
  convocatoria: string;
  ccaa: string;
  anio: number;
  link: string;
}

function parseCsv(filePath: string): ExamenRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim() !== '');

  function parseLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        insideQuotes = !insideQuotes;
      } else if (ch === ',' && !insideQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  // First line is the header — map column names to indices
  const headers = parseLine(lines[0]).map((h) => h.trim());
  const idx = {
    asignatura: headers.indexOf('asignatura'),
    anyo:       headers.indexOf('año'),
    tipo:       headers.indexOf('tipo'),
    ccaa:       headers.indexOf('ccaa'),
    link:       headers.indexOf('link'),
    operativo:  headers.indexOf('operativo'),
  };

  const rows: ExamenRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);

    const operativo = fields[idx.operativo]?.trim().toLowerCase();
    // Solo insertar exámenes con link operativo
    if (operativo !== 'si') continue;

    const materia      = fields[idx.asignatura]?.trim();
    const convocatoria = fields[idx.tipo]?.trim();
    const ccaa         = fields[idx.ccaa]?.trim();
    const anioRaw      = fields[idx.anyo]?.trim();
    const link         = fields[idx.link]?.trim();

    const anio = parseInt(anioRaw, 10);

    if (!materia || !convocatoria || !ccaa || isNaN(anio) || !link) continue;

    rows.push({ materia, convocatoria, ccaa, anio, link });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Batch insert helper
// ---------------------------------------------------------------------------
async function insertBatch(client: any, rows: ExamenRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const valuePlaceholders: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  for (const row of rows) {
    valuePlaceholders.push(
      `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`
    );
    values.push(row.materia, row.convocatoria, row.ccaa, row.anio, row.link);
    paramIndex += 5;
  }

  const query = `
    INSERT INTO "Examenes" (materia, convocatoria, ccaa, anio, link)
    VALUES ${valuePlaceholders.join(', ')}
    ON CONFLICT ON CONSTRAINT examenes_materia_convocatoria_ccaa_anio_unique DO NOTHING
  `;

  const result = await client.query(query, values);
  return result.rowCount ?? 0;
}

// ---------------------------------------------------------------------------
// Main migration function
// ---------------------------------------------------------------------------
export async function runMigrations(dbPool: Pool = pool): Promise<void> {
  const client = await dbPool.connect();
  try {
    console.log('[DB] Running migration 002 — Examenes...');
    await client.query(createExamenesTable);
    console.log('[DB] Table "Examenes" ready.');

    const csvPath = path.join(__dirname, '..', 'data', 'links_ordenados.csv');
    const rows = parseCsv(csvPath);
    console.log(`[DB] Parsed ${rows.length} operative rows from CSV.`);

    const BATCH_SIZE = 100;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      inserted += await insertBatch(client, batch);
    }

    console.log(`[DB] Seed complete — ${inserted} rows inserted (duplicates ignored).`);
    console.log('[DB] Migration 002 completed.');
  } catch (err) {
    console.error('[DB] Migration 002 error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Standalone script: npm run migrate:examenes
// ---------------------------------------------------------------------------
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => {
      pool.end();
      process.exit(1);
    });
}
