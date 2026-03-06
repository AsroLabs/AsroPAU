import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import pool from '../index';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const createGradosTable = `
  CREATE TABLE IF NOT EXISTS "Grados" (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    location   VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    "cutOff"   NUMERIC(6, 3) NOT NULL,
    CONSTRAINT grados_title_location_university_unique UNIQUE (title, location, university)
  );
`;

// ---------------------------------------------------------------------------
// CSV parser
// Handles RFC-4180 quoted fields (e.g. "13,450") without external deps.
// ---------------------------------------------------------------------------
interface GradoRow {
  title: string;
  location: string;
  university: string;
  cutOff: number;
}

function parseCsv(filePath: string): GradoRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim() !== '');

  // Parse a single CSV line respecting quoted fields
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
    titulacion: headers.indexOf('titulacion'),
    universidad: headers.indexOf('universidad'),
    provincia: headers.indexOf('provincia'),
    nota_corte_num: headers.indexOf('nota_corte_num'),
  };

  const rows: GradoRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);

    const title = fields[idx.titulacion]?.trim();
    const university = fields[idx.universidad]?.trim();
    const location = fields[idx.provincia]?.trim();
    const cutOffRaw = fields[idx.nota_corte_num]?.trim();
    const cutOff = parseFloat(cutOffRaw);

    // Skip rows with missing or non-numeric cutOff
    if (!title || !university || !location || isNaN(cutOff)) continue;

    rows.push({ title, location, university, cutOff });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Batch insert helper
// ---------------------------------------------------------------------------
async function insertBatch(client: any, rows: GradoRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const valuePlaceholders: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  for (const row of rows) {
    valuePlaceholders.push(
      `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`
    );
    values.push(row.title, row.location, row.university, row.cutOff);
    paramIndex += 4;
  }

  const query = `
    INSERT INTO "Grados" (title, location, university, "cutOff")
    VALUES ${valuePlaceholders.join(', ')}
    ON CONFLICT ON CONSTRAINT grados_title_location_university_unique DO NOTHING
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
    console.log('[DB] Running migrations...');
    await client.query(createGradosTable);
    console.log('[DB] Table "Grados" ready.');

    const csvPath = path.join(__dirname, '..', 'data', 'notas_corte.csv');
    const rows = parseCsv(csvPath);
    console.log(`[DB] Parsed ${rows.length} rows from CSV.`);

    const BATCH_SIZE = 100;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      inserted += await insertBatch(client, batch);
    }

    console.log(`[DB] Seed complete — ${inserted} rows inserted (duplicates ignored).`);
    console.log('[DB] Migrations completed.');
  } catch (err) {
    console.error('[DB] Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Standalone script: npm run migrate
// ---------------------------------------------------------------------------
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => {
      pool.end();
      process.exit(1);
    });
}
