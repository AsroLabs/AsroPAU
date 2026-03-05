import { Pool } from 'pg';
import pool from '../index';

const createGradosTable = `
  CREATE TABLE IF NOT EXISTS "Grados" (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    location   VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    "cutOff"   NUMERIC(5, 3) NOT NULL,
    CONSTRAINT grados_title_location_university_unique UNIQUE (title, location, university)
  );
`;

const seedGrados = `
  INSERT INTO "Grados" (title, location, university, "cutOff")
  VALUES
    ('Grado en Medicina', 'Madrid', 'Universidad Complutense de Madrid', 13.310),
    ('Grado en Medicina', 'Barcelona', 'Universidad de Barcelona', 13.500),
    ('Grado en Ingeniería Biomédica', 'Barcelona', 'Universidad de Barcelona', 12.100),
    ('Grado en Biotecnología', 'Valencia', 'Universidad Politécnica de Valencia', 11.890),
    ('Grado en Derecho', 'Madrid', 'Universidad Complutense de Madrid', 10.500),
    ('Grado en Derecho', 'Barcelona', 'Universidad de Barcelona', 11.000),
    ('Grado en Psicología', 'Madrid', 'Universidad Complutense de Madrid', 12.000),
    ('Grado en Informática', 'Madrid', 'Universidad Complutense de Madrid', 10.500),
    ('Grado en Administración y Dirección de Empresas', 'Madrid', 'Universidad Autónoma de Madrid', 10.200),
    ('Grado en Administración y Dirección de Empresas', 'Sevilla', 'Universidad de Sevilla', 9.800),
    ('Grado en Arquitectura', 'Madrid', 'Universidad Politécnica de Madrid', 11.500),
    ('Grado en Arquitectura', 'Barcelona', 'Universidad Politécnica de Cataluña', 12.300),
    ('Grado en Enfermería', 'Valencia', 'Universidad de Valencia', 9.500),
    ('Grado en Enfermería', 'Madrid', 'Universidad Complutense de Madrid', 10.100),
    ('Grado en Farmacia', 'Granada', 'Universidad de Granada', 11.200),
    ('Grado en Física', 'Barcelona', 'Universidad de Barcelona', 9.000),
    ('Grado en Matemáticas', 'Madrid', 'Universidad Autónoma de Madrid', 8.500),
    ('Grado en Química', 'Sevilla', 'Universidad de Sevilla', 8.900),
    ('Grado en Periodismo', 'Madrid', 'Universidad Complutense de Madrid', 9.700),
    ('Grado en Veterinaria', 'Zaragoza', 'Universidad de Zaragoza', 10.800)
  ON CONFLICT DO NOTHING;
`;

/**
 * Runs migrations using the shared pool.
 * Safe to call at server startup — does NOT close the pool.
 */
export async function runMigrations(dbPool: Pool = pool): Promise<void> {
  const client = await dbPool.connect();
  try {
    console.log('[DB] Running migrations...');
    await client.query(createGradosTable);
    console.log('[DB] Table "Grados" ready.');
    await client.query(seedGrados);
    console.log('[DB] Seed data inserted (duplicates ignored).');
    console.log('[DB] Migrations completed.');
  } catch (err) {
    console.error('[DB] Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow running as a standalone script: `npm run migrate`
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => {
      pool.end();
      process.exit(1);
    });
}
