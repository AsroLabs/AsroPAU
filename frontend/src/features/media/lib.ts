export const TRONCALES_OPTIONS = [
  'Biología',
  'Química',
  'Matemáticas II',
  'Física',
  'Economía',
  'Lengua Extranjera',
  'Geografía',
  'Geología',
]

export const ADMISION_OPTIONS = [
  'Biología',
  'Química',
  'Matemáticas II',
  'Física',
  'Economía',
  'Lengua Extranjera',
  'Geografía',
  'Geología',
  'Artes Plásticas',
  'Dibujo Técnico',
]

export function formatGrade(n: number): string {
  if (n < 0) n = 0
  if (n > 14) n = 14
  return n.toFixed(3).replace('.', ',')
}

/**
 * Calcula la nota de acceso (notaAcceso = 0.6 * mediaBachiller + 0.4 * mediaFaseAcceso)
 */
export function calculateNotaAcceso(
  bachillerato: number,
  lengua: number,
  historiaFilosofia: number,
  ingles: number,
  troncalGrade: number,
): number {
  const mediaFaseAcceso = (lengua + historiaFilosofia + ingles + troncalGrade) / 4
  return bachillerato * 0.6 + mediaFaseAcceso * 0.4
}

/**
 * Calcula la mejor aportación de la fase de admisión
 * (suma de las 2 mejores aportaciones ponderadas)
 */
export function calculateAdmisionPart(
  subjects: Array<{ grade: number; weight: number }>,
): number {
  const aportaciones = subjects
    .filter((s) => s.grade > 0)
    .map((s) => ({
      aportacion: s.grade * s.weight,
      nota: s.grade,
      ponderacion: s.weight,
    }))
    .sort((a, b) => b.aportacion - a.aportacion)

  if (aportaciones.length === 0) return 0

  const mejores = aportaciones.slice(0, 2)
  return mejores.reduce((acc, a) => acc + a.aportacion, 0)
}

/**
 * Calcula la nota total de admisión
 */
export function calculateTotalGrade(notaAcceso: number, admisionPart: number): number {
  return notaAcceso + admisionPart
}
