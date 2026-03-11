/**
 * Mapa de reglas matemáticas → ejemplo ilustrativo.
 * La clave es el rule_name (pill corto) o la description parcial que devuelve el backend.
 * Se hace lookup por coincidencia exacta primero, luego por substring.
 */

export interface RuleExample {
  /** Nombre completo de la regla para el título del popup */
  title: string
  /** Expresión LaTeX que ilustra la regla genéricamente */
  latex: string
  /** Frase en lenguaje natural que explica la intuición */
  prose: string
}

const examples: Record<string, RuleExample> = {
  // ── Derivadas ──────────────────────────────────────────────────────────────
  Potencia: {
    title: 'Regla de la potencia',
    latex: '\\dfrac{d}{dx}\\left(x^n\\right) = n \\cdot x^{n-1}',
    prose: 'Baja el exponente como coeficiente y resta 1 al exponente. Ejemplo: la derivada de x³ es 3x².',
  },
  Suma: {
    title: 'Regla de la suma / diferencia',
    latex: '\\dfrac{d}{dx}\\left(f + g\\right) = f^{\\prime} + g^{\\prime}',
    prose: 'La derivada de una suma es la suma de las derivadas. Cada término se deriva por separado.',
  },
  Producto: {
    title: 'Regla del producto',
    latex: '\\dfrac{d}{dx}\\left(u \\cdot v\\right) = u^{\\prime}v + u\\,v^{\\prime}',
    prose: 'Para derivar un producto de dos funciones: derivada del primero por el segundo, más el primero por la derivada del segundo.',
  },
  Cadena: {
    title: 'Regla de la cadena',
    latex: '\\dfrac{d}{dx}\\bigl(f(g(x))\\bigr) = f^{\\prime}(g(x))\\cdot g^{\\prime}(x)',
    prose: 'Cuando hay una función dentro de otra, se deriva la función externa evaluada en la interna, multiplicando por la derivada de la interna.',
  },
  Constante: {
    title: 'Regla del múltiplo constante',
    latex: '\\dfrac{d}{dx}\\left(k \\cdot f(x)\\right) = k \\cdot f^{\\prime}(x)',
    prose: 'Una constante multiplicativa sale fuera de la derivada sin cambios.',
  },
  Logaritmo: {
    title: 'Derivada del logaritmo',
    latex: '\\dfrac{d}{dx}\\ln(u) = \\dfrac{u^{\\prime}}{u}',
    prose: 'La derivada de ln(u) es la derivada de u dividida entre u.',
  },
  Exponencial: {
    title: 'Derivada de la exponencial',
    latex: '\\dfrac{d}{dx}\\left(e^{u}\\right) = e^{u} \\cdot u^{\\prime}',
    prose: 'La exponencial de base e es la única función que es su propia derivada (si u = x). Con argumento compuesto, se multiplica por la derivada interior.',
  },
  Trig: {
    title: 'Derivadas trigonométricas',
    latex: [
      '\\dfrac{d}{dx}\\sin(u) = \\cos(u)\\cdot u^{\\prime}',
      '\\qquad',
      '\\dfrac{d}{dx}\\cos(u) = -\\sin(u)\\cdot u^{\\prime}',
    ].join(''),
    prose: 'Las derivadas del seno y coseno se alternan y cambian de signo. Con argumento compuesto se aplica la regla de la cadena.',
  },
  Derivada: {
    title: 'Regla de derivación',
    latex: "f^{\\prime}(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}",
    prose: 'La derivada mide la tasa de cambio instantánea de una función: cómo varía la salida cuando la entrada cambia infinitesimalmente.',
  },

  // ── Integrales ─────────────────────────────────────────────────────────────
  'Por partes': {
    title: 'Integración por partes',
    latex: '\\int u\\,dv = u\\,v - \\int v\\,du',
    prose: 'Útil cuando el integrando es un producto. Se elige u para derivar y dv para integrar, buscando que la nueva integral sea más sencilla.',
  },
  Integración: {
    title: 'Regla de integración',
    latex: '\\int f(x)\\,dx = F(x) + C \\quad \\text{donde} \\quad F^{\\prime}(x) = f(x)',
    prose: 'Integrar es el proceso inverso de derivar. La constante C recoge todas las primitivas posibles de la función.',
  },

  // ── Álgebra ────────────────────────────────────────────────────────────────
  Factorización: {
    title: 'Factorización',
    latex: 'x^2 - 5x + 6 = (x-2)(x-3)',
    prose: 'Factorizar consiste en escribir una expresión como producto de factores más simples. Facilita encontrar raíces e igualdades.',
  },
  Distributiva: {
    title: 'Propiedad distributiva',
    latex: 'a(b + c) = ab + ac',
    prose: 'Al multiplicar un factor por una suma, cada sumando se multiplica por ese factor. Permite expandir o reagrupar expresiones.',
  },
  Simplificar: {
    title: 'Simplificación',
    latex: '\\dfrac{6x^3}{3x} = 2x^2',
    prose: 'Simplificar reduce la expresión a su forma más compacta cancelando factores comunes o combinando términos semejantes.',
  },
}

/**
 * Busca el ejemplo para una regla dada.
 * Primero por clave exacta, luego si alguna clave está contenida en la cadena.
 */
export function getRuleExample(ruleName: string): RuleExample | null {
  if (!ruleName) return null

  // Exact match
  if (examples[ruleName]) return examples[ruleName]

  // Substring match: clave contenida en ruleName
  for (const key of Object.keys(examples)) {
    if (ruleName.includes(key)) return examples[key]
  }

  return null
}
