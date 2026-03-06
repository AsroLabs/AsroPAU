export interface ExplanationOutput {
  rule_name: string
  rule_category: string
  explanation: string
  conceptual_reasoning: string
  algebraic_justification: string
  transformation_description: string
  educational_note: string
}

export interface StepAnalysis {
  before: string
  after: string
  diff: DiffResult
  transformation: TransformationType
}

export interface DiffResult {
  type: 'add' | 'remove' | 'replace' | 'unchanged'
  value: string
  side: 'left' | 'right' | 'both'
}

export type TransformationType =
  | 'subtract_constant'
  | 'add_constant'
  | 'divide_coefficient'
  | 'multiply_coefficient'
  | 'move_term'
  | 'combine_like_terms'
  | 'simplify'
  | 'expand'
  | 'factor'
  | 'square_root'
  | 'log_property'
  | 'derivative_rule'
  | 'integral_rule'
  | 'unknown'

export interface RuleTemplate {
  rule_name: string
  rule_category: string
  explanation: (ctx: RuleContext) => string
  conceptual_reasoning: (ctx: RuleContext) => string
  algebraic_justification: (ctx: RuleContext) => string
  transformation_description: (ctx: RuleContext) => string
  educational_note: (ctx: RuleContext) => string
}

export interface RuleContext {
  value?: string
  fromSide?: 'left' | 'right'
  toSide?: 'left' | 'right'
  sign?: string
  coefficient?: string
  variable?: string
  expression?: string
}

export const RULE_TEMPLATES: Record<TransformationType, RuleTemplate> = {
  subtract_constant: {
    rule_name: 'Propiedad de igualdad (sustracción)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se resta ${ctx.value} a ambos miembros de la ecuación para eliminar el término constante del lado izquierdo.`,
    conceptual_reasoning: () =>
      'En una ecuación, podemos realizar la misma operación en ambos miembros sin alterar la igualdad. Restar es la operación inversa a sumar.',
    algebraic_justification: () =>
      `Si a = b, entonces a − c = b − c para cualquier número real c.`,
    transformation_description: (ctx) =>
      `Se sustrae ${ctx.value} en ambos lados de la ecuación:\n${ctx.expression?.replace('=', '− ' + ctx.value + ' = ')} (simplificado)`,
    educational_note: () =>
      'Este paso aísla el término con la variable eliminando el término constante. Es fundamental mantener la ecuación balanceada.'
  },

  add_constant: {
    rule_name: 'Propiedad de igualdad (adición)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se suma ${ctx.value} a ambos miembros de la ecuación.`,
    conceptual_reasoning: () =>
      'Sumar es la operación inversa a restar. Al sumar la misma cantidad a ambos lados, preservamos la igualdad.',
    algebraic_justification: () =>
      'Si a = b, entonces a + c = b + c para cualquier número real c.',
    transformation_description: (ctx) =>
      `Se adiciona ${ctx.value} a ambos lados de la ecuación.`,
    educational_note: () =>
      'Al sumar, el término pasa al otro lado con signo positivo. Verifica siempre que ambos lados se modifiquen igual.'
  },

  divide_coefficient: {
    rule_name: 'Propiedad de igualdad (división)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se dividen ambos miembros por ${ctx.coefficient} para resolver la variable.`,
    conceptual_reasoning: () =>
      'La división es la operación inversa a la multiplicación. Dividimos ambos lados por el coeficiente para "deshacer" la multiplicación de la variable.',
    algebraic_justification: (ctx) =>
      `Si a = b y c ≠ 0, entonces a/c = b/c. En este caso, dividimos por ${ctx.coefficient}.`,
    transformation_description: (ctx) =>
      `Se divide toda la ecuación por ${ctx.coefficient}:\nx = ${ctx.value}/${ctx.coefficient}`,
    educational_note: () =>
      'Dividir por el coeficiente aísla la variable. IMPORTANTE: No puedes dividir por cero.'
  },

  multiply_coefficient: {
    rule_name: 'Propiedad de igualdad (multiplicación)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se multiplican ambos miembros por ${ctx.coefficient}.`,
    conceptual_reasoning: () =>
      'Multiplicamos ambos lados para deshacer una división o para eliminar fracciones.',
    algebraic_justification: () =>
      'Si a = b, entonces a·c = b·c para cualquier número real c.',
    transformation_description: (ctx) =>
      `Se multiplica la ecuación completa por ${ctx.coefficient}.`,
    educational_note: () =>
      'Al multiplicar, podemos eliminar denominadores. Verifica que no multipliques por cero.'
  },

  move_term: {
    rule_name: 'Transposición de términos',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se transpone el término ${ctx.value} al otro lado de la igualdad, cambiando su signo.`,
    conceptual_reasoning: () =>
      'Trasponer un término equivale a restarlo de su lado original y sumarlo al otro. El signo cambia porque estamos aplicando la operación inversa.',
    algebraic_justification: () =>
      `Si a + c = b, entonces a = b − c. El término "pasa" restando porque aplicamos la operación inversa a ambos lados.`,
    transformation_description: (ctx) =>
      `El término ${ctx.value} cambia de lado con signo contrario.`,
    educational_note: () =>
      '记忆: "Lo que está sumando resta, lo que está restando suma". Este es el principio de transposición.'
  },

  combine_like_terms: {
    rule_name: 'Reducción de términos semejantes',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se combinan los términos que tienen la misma parte literal (misma variable elevada al mismo exponente).',
    conceptual_reasoning: () =>
      'Los términos semejantes representan la misma cantidad y pueden sumarse o restarse directamente. Es como sumar manzanas con manzanas.',
    algebraic_justification: () =>
      'ax + bx = (a + b)x — factorizamos la variable y sumamos los coeficientes.',
    transformation_description: () =>
      'Se agrupan y reducen los términos con igual variable y exponente.',
    educational_note: () =>
      'Solo puedes combinar términos con la misma variable y el mismo exponente: x² con x², pero x² con x NO.'
  },

  simplify: {
    rule_name: 'Simplificación algebraica',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se simplifica la expresión eliminando factores comunes o reduciendo operaciones.',
    conceptual_reasoning: () =>
      'La simplificación no altera el valor de la expresión, solo la escribe de forma más simple.',
    algebraic_justification: () =>
      'Aplicamos propiedades de los números reales: distributiva, asociativa, conmutativa.',
    transformation_description: () =>
      'Se reduce la expresión a su forma más simple.',
    educational_note: () =>
      'Simplificar hace más fácil los cálculos siguientes. Busca siempre la forma más económica.'
  },

  expand: {
    rule_name: 'Expansión (propiedad distributiva)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se expande la expresión multiplicando ${ctx.value} por cada término dentro del paréntesis.`,
    conceptual_reasoning: () =>
      'La propiedad distributiva dice que a(b + c) = ab + ac. Multiplicamos el factor exterior por cada término interior.',
    algebraic_justification: () =>
      'a(b + c) = ab + ac — distributividad de la multiplicación sobre la suma.',
    transformation_description: (ctx) =>
      `Se desarrolla: ${ctx.value}(a + b) = ${ctx.value}a + ${ctx.value}b`,
    educational_note: () =>
      'CUIDADO: multiplica TODOS los términos del paréntesis, no solo el primero.'
  },

  factor: {
    rule_name: 'Factorización',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se extrae factor común para escribir la expresión como producto de factores.',
    conceptual_reasoning: () =>
      'Factorizar es el proceso inverso a expandir. Buscamos qué factor se repite en todos los términos.',
    algebraic_justification: () =>
      'ab + ac = a(b + c) —sacamos factor común a.',
    transformation_description: () =>
      'Se agrupa bajo un paréntesis el factor común a todos los términos.',
    educational_note: () =>
      'La factorización es esencial para resolver ecuaciones de segundo grado y simplificar fracciones.'
  },

  square_root: {
    rule_name: 'Extracción de raíz cuadrada',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplica raíz cuadrada a ambos miembros de la ecuación.',
    conceptual_reasoning: () =>
      'Si x² = a, entonces x = ±√a. La raíz cuadrada deshace el cuadrado.',
    algebraic_justification: () =>
      'Si a = b ≥ 0, entonces √a = √b. OJO: la raíz tiene dos soluciones, positiva y negativa.',
    transformation_description: () =>
      'Se calcula la raíz cuadrada en ambos lados, considerando ambas soluciones.',
    educational_note: () =>
      'No olvides el signo ±. Una ecuación cuadrática tiene hasta 2 soluciones.'
  },

  log_property: {
    rule_name: 'Propiedad de logaritmos',
    rule_category: 'Logaritmos',
    explanation: () =>
      'Se aplica una propiedad de logaritmos para simplificar o resolver.',
    conceptual_reasoning: () =>
      'Los logaritmos transforman productos en sumas, cocientes en restas, y potencias en productos.',
    algebraic_justification: () =>
      'log(a·b) = log(a) + log(b)\nlog(a/b) = log(a) − log(b)\nlog(aⁿ) = n·log(a)',
    transformation_description: () =>
      'Se aplica la propiedad logarítmica correspondiente.',
    educational_note: () =>
      'Estas propiedades permiten resolver ecuaciones logarítmicas convirtiéndolas en lineales.'
  },

  derivative_rule: {
    rule_name: 'Regla de derivación',
    rule_category: 'Derivadas',
    explanation: () =>
      'Se aplica una regla de derivación para calcular la derivada de la función.',
    conceptual_reasoning: () =>
      'La derivada representa la tasa de cambio instantánea. Cada tipo de función tiene su regla de derivación.',
    algebraic_justification: () =>
      'Reglas básicas:\n(d/dx)[xⁿ] = n·xⁿ⁻¹\n(d/dx)[k] = 0\n(d/dx)[f+g] = f\' + g\'',
    transformation_description: () =>
      'Se deriva la expresión según la regla correspondiente.',
    educational_note: () =>
      'Domina las reglas básicas: constante, potencia, suma, producto, cociente y cadena.'
  },

  integral_rule: {
    rule_name: 'Regla de integración',
    rule_category: 'Integrales',
    explanation: () =>
      'Se aplica una técnica de integración para encontrar la primitiva.',
    conceptual_reasoning: () =>
      'La integral es la operación inversa a la derivada. Encontramos una función cuya derivada es la dada.',
    algebraic_justification: () =>
      '∫xⁿ dx = xⁿ⁺¹/(n+1) + C (para n ≠ −1)\n∫k dx = kx + C',
    transformation_description: () =>
      'Se integra la expresión según la técnica correspondiente.',
    educational_note: () =>
      'No olvides la constante de integración +C. Representa todas las primitivas posibles.'
  },

  unknown: {
    rule_name: 'Transformación algebraica',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se realiza una transformación algebraica en la expresión.',
    conceptual_reasoning: () =>
      'Las transformaciones algebraicas preservan el valor de la expresión mientras facilitan su manipulación.',
    algebraic_justification: () =>
      'Se aplican las propiedades de los números reales y las operaciones algebraicas.',
    transformation_description: () =>
      'Se transforma la expresión según las reglas del álgebra.',
    educational_note: () =>
      'Verifica cada paso para mantener la equivalencia.'
  }
}
