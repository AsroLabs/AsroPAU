// ─── Output types ─────────────────────────────────────────────────────────────

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
  diff: DiffResult[]
  transformation: TransformationType
}

/** Legacy token-level diff result — kept for backward compat, now populated from DiffOp */
export interface DiffResult {
  type: 'add' | 'remove' | 'replace' | 'unchanged'
  value: string
  side: 'left' | 'right' | 'both'
}

// ─── Transformation types (~40) ───────────────────────────────────────────────

export type TransformationType =
  // ── Equation operations (both sides) ───────────────────
  | 'subtract_constant'       // a + k = b  →  a = b - k
  | 'add_constant'            // a - k = b  →  a = b + k
  | 'divide_coefficient'      // ka = b     →  a = b/k
  | 'multiply_coefficient'    // a/k = b    →  a = kb
  | 'multiply_both_sides'     // generic multiply
  | 'divide_both_sides'       // generic divide
  // ── Term manipulation ──────────────────────────────────
  | 'move_term'               // term crosses = sign
  | 'move_term_left'          // move to left side
  | 'move_term_right'         // move to right side
  | 'transpose_term'          // sign change on crossing
  | 'combine_like_terms'      // 2x + 3x → 5x
  | 'collect_variable_terms'  // bring all x terms to one side
  | 'isolate_variable'        // final x = k step
  // ── Simplification ────────────────────────────────────
  | 'simplify'                // generic simplify
  | 'simplify_fraction'       // 6/4 → 3/2
  | 'simplify_expression'     // multi-step simplification
  | 'cancel_terms'            // +k - k → 0
  | 'evaluate_arithmetic'     // 2 + 3 → 5
  | 'zero_product'            // k·0 = 0
  // ── Algebraic structure ───────────────────────────────
  | 'expand'                  // a(b+c) → ab + ac
  | 'expand_binomial'         // (a+b)² → a² + 2ab + b²
  | 'factor'                  // factor out common term
  | 'factor_common'           // ax + ay → a(x+y)
  | 'factor_quadratic'        // x² + bx + c → (x+p)(x+q)
  | 'factor_difference_squares' // a² - b² → (a+b)(a-b)
  | 'complete_the_square'     // x² + bx → (x + b/2)² - (b/2)²
  | 'rewrite_as_zero'         // f(x) = g(x) → f(x) - g(x) = 0
  // ── Equations ─────────────────────────────────────────
  | 'quadratic_formula'       // apply x = (-b±√Δ)/2a
  | 'compute_discriminant'    // Δ = b² - 4ac
  | 'identify_coefficients'   // label a, b, c in ax²+bx+c
  | 'square_root_both_sides'  // x² = k → x = ±√k
  | 'linear_equation'         // simple ax + b = c solve step
  | 'cross_multiply'          // a/b = c/d → ad = bc
  | 'rationalize'             // multiply by conjugate
  // ── Functions ─────────────────────────────────────────
  | 'apply_log'               // take log of both sides
  | 'log_property'            // log(ab) = log(a)+log(b), etc.
  | 'exponent_property'       // a^m · a^n = a^(m+n), etc.
  | 'trig_identity'           // sin²+cos²=1, etc.
  // ── Calculus ──────────────────────────────────────────
  | 'derivative_power_rule'   // d/dx[xⁿ] = nxⁿ⁻¹
  | 'derivative_constant'     // d/dx[k] = 0
  | 'derivative_sum_rule'     // (f+g)' = f'+g'
  | 'derivative_product_rule' // (fg)' = f'g + fg'
  | 'derivative_chain_rule'   // (f∘g)' = f'(g)·g'
  | 'derivative_trig'         // d/dx[sin x] = cos x, etc.
  | 'derivative_exp_log'      // d/dx[eˣ] = eˣ, d/dx[ln x] = 1/x
  | 'integral_power_rule'     // ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
  | 'integral_constant'       // ∫k dx = kx + C
  | 'integral_linearity'      // ∫(f+g) dx = ∫f dx + ∫g dx
  | 'integral_substitution'   // u-substitution
  | 'integral_by_parts'       // ∫u dv = uv - ∫v du
  | 'limit_substitution'      // direct plug in
  | 'lhopital'                // L'Hôpital's rule
  // ── Meta ──────────────────────────────────────────────
  | 'derivative_rule'         // generic derivative (legacy compat)
  | 'integral_rule'           // generic integral  (legacy compat)
  | 'unknown'

// ─── Template system ─────────────────────────────────────────────────────────

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
  termMoved?: string
  lhs?: string
  rhs?: string
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const RULE_TEMPLATES: Record<TransformationType, RuleTemplate> = {

  // ── Equation operations ────────────────────────────────────────────────────

  subtract_constant: {
    rule_name: 'Propiedad de igualdad (sustracción)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se resta ${ctx.value || 'la constante'} a ambos miembros para eliminar el término constante del lado izquierdo.`,
    conceptual_reasoning: () =>
      'Podemos realizar la misma operación en ambos miembros sin alterar la igualdad. Restar es la operación inversa a sumar.',
    algebraic_justification: () =>
      'Si a = b, entonces a − c = b − c para todo c ∈ ℝ.',
    transformation_description: (ctx) =>
      `Se sustrae ${ctx.value || 'la constante'} en ambos lados.`,
    educational_note: () =>
      'Este paso aísla el término con la variable. Mantener la ecuación balanceada es esencial.'
  },

  add_constant: {
    rule_name: 'Propiedad de igualdad (adición)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se suma ${ctx.value || 'la constante'} a ambos miembros de la ecuación.`,
    conceptual_reasoning: () =>
      'Sumar la misma cantidad a ambos lados preserva la igualdad.',
    algebraic_justification: () =>
      'Si a = b, entonces a + c = b + c para todo c ∈ ℝ.',
    transformation_description: (ctx) =>
      `Se adiciona ${ctx.value || 'la constante'} a ambos lados.`,
    educational_note: () =>
      'Verifica que la misma cantidad se suma en ambos miembros.'
  },

  divide_coefficient: {
    rule_name: 'Propiedad de igualdad (división)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se dividen ambos miembros entre ${ctx.coefficient || 'el coeficiente'} para despejar la variable.`,
    conceptual_reasoning: () =>
      'Dividir es la operación inversa a multiplicar. Dividimos por el coeficiente para "deshacer" la multiplicación de la variable.',
    algebraic_justification: (ctx) =>
      `Si a = b y c ≠ 0, entonces a/c = b/c. Aquí c = ${ctx.coefficient || 'k'}.`,
    transformation_description: (ctx) =>
      `Se divide toda la ecuación entre ${ctx.coefficient || 'el coeficiente'}.`,
    educational_note: () =>
      'IMPORTANTE: nunca dividas por cero. Verifica que el coeficiente sea distinto de cero.'
  },

  multiply_coefficient: {
    rule_name: 'Propiedad de igualdad (multiplicación)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se multiplican ambos miembros por ${ctx.coefficient || 'el factor'}.`,
    conceptual_reasoning: () =>
      'Multiplicar ambos lados elimina denominadores o deshace una división.',
    algebraic_justification: () =>
      'Si a = b, entonces a·c = b·c para todo c ∈ ℝ.',
    transformation_description: (ctx) =>
      `Se multiplica la ecuación completa por ${ctx.coefficient || 'el factor'}.`,
    educational_note: () =>
      'Al multiplicar podemos eliminar denominadores. Asegúrate de no multiplicar por cero.'
  },

  multiply_both_sides: {
    rule_name: 'Multiplicar ambos miembros',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se multiplican ambos lados por ${ctx.value || 'un factor'}.`,
    conceptual_reasoning: () =>
      'La multiplicación preserva la igualdad cuando se aplica a ambos miembros.',
    algebraic_justification: () =>
      'Si a = b, entonces ka = kb para todo k.',
    transformation_description: (ctx) =>
      `Ambos miembros se multiplican por ${ctx.value || 'el factor'}.`,
    educational_note: () =>
      'Útil para eliminar fracciones o despejar la variable del denominador.'
  },

  divide_both_sides: {
    rule_name: 'Dividir ambos miembros',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se dividen ambos lados entre ${ctx.value || 'un divisor'}.`,
    conceptual_reasoning: () =>
      'Dividir ambos miembros por la misma cantidad no altera la igualdad.',
    algebraic_justification: () =>
      'Si a = b y k ≠ 0, entonces a/k = b/k.',
    transformation_description: (ctx) =>
      `Ambos miembros se dividen entre ${ctx.value || 'el divisor'}.`,
    educational_note: () =>
      'Comprueba siempre que el divisor sea distinto de cero antes de operar.'
  },

  // ── Term manipulation ──────────────────────────────────────────────────────

  move_term: {
    rule_name: 'Transposición de términos',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se traspone el término ${ctx.termMoved || ctx.value || ''} al otro lado de la igualdad, cambiando su signo.`,
    conceptual_reasoning: () =>
      'Trasponer equivale a restar en el lado original y sumar en el otro. El signo cambia porque aplicamos la operación inversa.',
    algebraic_justification: () =>
      'Si a + c = b, entonces a = b − c. El término "cruza" el signo igual cambiando de signo.',
    transformation_description: (ctx) =>
      `${ctx.termMoved || 'El término'} pasa al otro lado con signo contrario.`,
    educational_note: () =>
      '"Lo que suma en un lado, resta en el otro." Este es el principio de transposición.'
  },

  move_term_left: {
    rule_name: 'Mover término al lado izquierdo',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se lleva ${ctx.termMoved || 'el término'} al lado izquierdo de la ecuación.`,
    conceptual_reasoning: () =>
      'Agrupamos todos los términos con la variable en el lado izquierdo para aislarla.',
    algebraic_justification: () =>
      'Restamos el término del lado derecho en ambos miembros.',
    transformation_description: (ctx) =>
      `${ctx.termMoved || 'El término'} se mueve al lado izquierdo, cambiando de signo.`,
    educational_note: () =>
      'Es una convención habitual colocar la variable en el lado izquierdo.'
  },

  move_term_right: {
    rule_name: 'Mover término al lado derecho',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se lleva ${ctx.termMoved || 'el término'} al lado derecho de la ecuación.`,
    conceptual_reasoning: () =>
      'Agrupamos los términos constantes en el lado derecho.',
    algebraic_justification: () =>
      'Restamos el término del lado izquierdo en ambos miembros.',
    transformation_description: (ctx) =>
      `${ctx.termMoved || 'El término'} se mueve al lado derecho, cambiando de signo.`,
    educational_note: () =>
      'Las constantes van a la derecha; los términos con variable, a la izquierda.'
  },

  transpose_term: {
    rule_name: 'Transposición con cambio de signo',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `El término ${ctx.termMoved || ''} cambia de signo al cruzar el signo de igual.`,
    conceptual_reasoning: () =>
      'Al restar en ambos lados, el término aparece en el otro lado con signo negativo.',
    algebraic_justification: () =>
      'a + k = b ⟺ a = b − k (se restó k en ambos lados).',
    transformation_description: (ctx) =>
      `El término ${ctx.termMoved || ''} "cruza" el = y cambia de + a − (o viceversa).`,
    educational_note: () =>
      'Recuerda: solo cambia el signo si el término cruza el = . Dentro del mismo lado, no cambia.'
  },

  combine_like_terms: {
    rule_name: 'Reducción de términos semejantes',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se combinan los términos que tienen la misma parte literal (misma variable y exponente).',
    conceptual_reasoning: () =>
      'Los términos semejantes representan la misma cantidad y pueden sumarse directamente. Es como sumar manzanas con manzanas.',
    algebraic_justification: () =>
      'ax + bx = (a + b)x — se factoriza la variable y se suman los coeficientes.',
    transformation_description: () =>
      'Se agrupan y reducen los términos con igual variable y exponente.',
    educational_note: () =>
      'Solo puedes combinar x² con x², no x² con x. El exponente debe ser idéntico.'
  },

  collect_variable_terms: {
    rule_name: 'Agrupar términos con la variable',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se reúnen todos los términos que contienen la variable en un único lado de la ecuación.',
    conceptual_reasoning: () =>
      'Para despejar x, primero debemos tener todos los términos con x juntos en un solo lado.',
    algebraic_justification: () =>
      'Se utiliza la propiedad de igualdad: sumamos/restamos los términos con x en ambos lados.',
    transformation_description: () =>
      'Los términos con la incógnita se pasan al mismo lado de la ecuación.',
    educational_note: () =>
      'Estrategia habitual: variables a la izquierda, constantes a la derecha.'
  },

  isolate_variable: {
    rule_name: 'Despejar la variable',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se deja ${ctx.variable || 'x'} sola en un lado de la ecuación.`,
    conceptual_reasoning: () =>
      'El objetivo final de resolver una ecuación es expresar la variable en función de valores conocidos.',
    algebraic_justification: () =>
      'Aplicamos operaciones inversas (división, raíz, etc.) para dejar coeficiente 1 delante de la variable.',
    transformation_description: (ctx) =>
      `La variable ${ctx.variable || 'x'} queda aislada: ${ctx.variable || 'x'} = ${ctx.value || '...'}`,
    educational_note: () =>
      'Este es el paso final de la resolución. Comprueba la solución sustituyendo en la ecuación original.'
  },

  // ── Simplification ────────────────────────────────────────────────────────

  simplify: {
    rule_name: 'Simplificación algebraica',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se simplifica la expresión eliminando factores comunes o reduciendo operaciones.',
    conceptual_reasoning: () =>
      'La simplificación no altera el valor, solo escribe la expresión de forma más compacta.',
    algebraic_justification: () =>
      'Aplicamos propiedades de los reales: distributiva, asociativa, conmutativa.',
    transformation_description: () =>
      'La expresión se reduce a su forma más simple.',
    educational_note: () =>
      'Simplificar facilita los pasos siguientes. Busca siempre la forma más compacta.'
  },

  simplify_fraction: {
    rule_name: 'Simplificación de fracción',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se simplifica la fracción dividiendo numerador y denominador por su MCD${ctx.value ? ' (' + ctx.value + ')' : ''}.`,
    conceptual_reasoning: () =>
      'Una fracción equivalente se obtiene dividiendo ambos términos por el mismo factor distinto de cero.',
    algebraic_justification: () =>
      'a·k / (b·k) = a/b para k ≠ 0.',
    transformation_description: () =>
      'Se cancela el factor común en numerador y denominador.',
    educational_note: () =>
      'Verifica que el MCD sea correcto factorizando numerador y denominador por separado.'
  },

  simplify_expression: {
    rule_name: 'Simplificación de expresión',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplican varias propiedades algebraicas para simplificar la expresión en varios sub-pasos.',
    conceptual_reasoning: () =>
      'Una expresión simplificada mantiene el mismo valor pero en forma más manejable.',
    algebraic_justification: () =>
      'Se usan asociatividad, conmutatividad, distributividad y cancelación.',
    transformation_description: () =>
      'La expresión se reescribe en forma equivalente más simple.',
    educational_note: () =>
      'Realiza la simplificación paso a paso para no cometer errores.'
  },

  cancel_terms: {
    rule_name: 'Cancelación de términos opuestos',
    rule_category: 'Álgebra',
    explanation: () =>
      'Los términos que suman cero (opuestos) se eliminan.',
    conceptual_reasoning: () =>
      'k + (−k) = 0. Un término y su opuesto se anulan mutuamente.',
    algebraic_justification: () =>
      'a + k − k = a. La suma de opuestos es el elemento neutro de la suma.',
    transformation_description: () =>
      'Los términos opuestos presentes en el mismo lado se cancelan.',
    educational_note: () =>
      'Identifica pares de términos con igual valor y signos contrarios.'
  },

  evaluate_arithmetic: {
    rule_name: 'Cálculo aritmético',
    rule_category: 'Aritmética',
    explanation: () =>
      'Se realiza la operación aritmética para obtener el valor numérico resultante.',
    conceptual_reasoning: () =>
      'Las operaciones aritméticas entre números conocidos pueden resolverse directamente.',
    algebraic_justification: () =>
      'Aplicamos las reglas de la aritmética básica: suma, resta, producto o cociente.',
    transformation_description: () =>
      'Los números se operan y se reemplaza la expresión por su resultado.',
    educational_note: () =>
      'Respeta la jerarquía de operaciones: paréntesis > potencias > × / > + −'
  },

  zero_product: {
    rule_name: 'Propiedad del cero en el producto',
    rule_category: 'Álgebra',
    explanation: () =>
      'Cualquier número multiplicado por cero es cero.',
    conceptual_reasoning: () =>
      'El cero es el elemento absorbente de la multiplicación.',
    algebraic_justification: () =>
      'a · 0 = 0 para todo a ∈ ℝ.',
    transformation_description: () =>
      'El producto que contiene un factor cero se reemplaza por 0.',
    educational_note: () =>
      'Si un producto de factores es cero, al menos uno de los factores es cero.'
  },

  // ── Algebraic structure ──────────────────────────────────────────────────

  expand: {
    rule_name: 'Expansión (propiedad distributiva)',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se expande la expresión distribuyendo ${ctx.value || 'el factor'} sobre cada término del paréntesis.`,
    conceptual_reasoning: () =>
      'La propiedad distributiva: a(b + c) = ab + ac.',
    algebraic_justification: () =>
      'a(b + c) = ab + ac. Se multiplica el factor exterior por cada término interior.',
    transformation_description: (ctx) =>
      `Se desarrolla: ${ctx.value || 'a'}(b + c) = ${ctx.value || 'a'}b + ${ctx.value || 'a'}c`,
    educational_note: () =>
      'CUIDADO: distribuye sobre TODOS los términos del paréntesis, no solo el primero.'
  },

  expand_binomial: {
    rule_name: 'Desarrollo del cuadrado de un binomio',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se desarrolla el cuadrado del binomio usando la identidad (a ± b)² = a² ± 2ab + b².',
    conceptual_reasoning: () =>
      '(a + b)² = (a + b)(a + b). Aplicando la distributiva dos veces obtenemos tres términos.',
    algebraic_justification: () =>
      '(a + b)² = a² + 2ab + b²\n(a − b)² = a² − 2ab + b²',
    transformation_description: () =>
      'Se aplica la identidad del cuadrado del binomio.',
    educational_note: () =>
      'No confundas (a + b)² con a² + b². El término cruzado 2ab es fundamental.'
  },

  factor: {
    rule_name: 'Factorización',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se extrae factor común para escribir la expresión como producto de factores.',
    conceptual_reasoning: () =>
      'Factorizar es el proceso inverso a expandir. Buscamos el factor que se repite en todos los términos.',
    algebraic_justification: () =>
      'ab + ac = a(b + c) — distributiva en sentido inverso.',
    transformation_description: () =>
      'La expresión se reescribe como producto de factores.',
    educational_note: () =>
      'Identifica el MCD de todos los términos y extráelo como factor común.'
  },

  factor_common: {
    rule_name: 'Factor común',
    rule_category: 'Álgebra',
    explanation: (ctx) =>
      `Se saca ${ctx.value || 'el factor común'} como factor de todos los términos.`,
    conceptual_reasoning: () =>
      'Si todos los términos son múltiplos de un mismo factor, podemos factorizarlo.',
    algebraic_justification: () =>
      'ax + ay + az = a(x + y + z)',
    transformation_description: (ctx) =>
      `Se extrae ${ctx.value || 'el factor'} de todos los términos.`,
    educational_note: () =>
      'El factor común debe dividir exactamente a todos los coeficientes y potencias de variables.'
  },

  factor_quadratic: {
    rule_name: 'Factorización de trinomio cuadrático',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se factoriza el trinomio x² + bx + c buscando dos números cuyo producto sea c y cuya suma sea b.',
    conceptual_reasoning: () =>
      'x² + bx + c = (x + p)(x + q) donde p + q = b y p · q = c.',
    algebraic_justification: () =>
      'Si p y q son raíces de x² + bx + c = 0, entonces x² + bx + c = (x − p)(x − q).',
    transformation_description: () =>
      'El trinomio se escribe como producto de dos binomios.',
    educational_note: () =>
      'Si no encuentras p y q enteros, prueba con la fórmula cuadrática.'
  },

  factor_difference_squares: {
    rule_name: 'Diferencia de cuadrados',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplica la identidad a² − b² = (a + b)(a − b).',
    conceptual_reasoning: () =>
      'La diferencia de dos cuadrados perfectos siempre factoriza como (suma)(diferencia).',
    algebraic_justification: () =>
      'a² − b² = (a + b)(a − b)',
    transformation_description: () =>
      'Se identifica la forma a² − b² y se factoriza.',
    educational_note: () =>
      'Verifica que ambos términos sean cuadrados perfectos y que el signo sea negativo.'
  },

  complete_the_square: {
    rule_name: 'Completar el cuadrado',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se reescribe x² + bx sumando y restando (b/2)² para obtener un cuadrado perfecto.',
    conceptual_reasoning: () =>
      'x² + bx + (b/2)² = (x + b/2)². Añadimos y restamos (b/2)² para no alterar la expresión.',
    algebraic_justification: () =>
      'x² + bx = (x + b/2)² − (b/2)²',
    transformation_description: () =>
      'Se completa el cuadrado del trinomio cuadrático.',
    educational_note: () =>
      'Técnica útil para resolver ecuaciones cuadráticas y obtener el vértice de una parábola.'
  },

  rewrite_as_zero: {
    rule_name: 'Igualar a cero',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se pasan todos los términos al lado izquierdo, dejando 0 a la derecha.',
    conceptual_reasoning: () =>
      'La forma estándar de una ecuación algebraica es f(x) = 0. Facilita factorizar y aplicar la fórmula cuadrática.',
    algebraic_justification: () =>
      'f(x) = g(x) ⟺ f(x) − g(x) = 0',
    transformation_description: () =>
      'La ecuación se reescribe en la forma f(x) = 0.',
    educational_note: () =>
      'Tener todos los términos en un lado es prerequisito para factorizar o aplicar la fórmula cuadrática.'
  },

  // ── Equations ────────────────────────────────────────────────────────────

  quadratic_formula: {
    rule_name: 'Fórmula cuadrática (Bháskara)',
    rule_category: 'Ecuaciones de 2.º grado',
    explanation: () =>
      'Se aplica la fórmula x = (−b ± √Δ) / 2a para obtener las soluciones.',
    conceptual_reasoning: () =>
      'La fórmula cuadrática es la solución general de ax² + bx + c = 0. Siempre funciona cuando Δ ≥ 0.',
    algebraic_justification: () =>
      'x = (−b ± √(b² − 4ac)) / (2a)',
    transformation_description: () =>
      'Se sustituyen los coeficientes a, b, c en la fórmula.',
    educational_note: () =>
      '3 casos: Δ > 0 → 2 soluciones reales; Δ = 0 → 1 solución (raíz doble); Δ < 0 → sin solución real.'
  },

  compute_discriminant: {
    rule_name: 'Cálculo del discriminante',
    rule_category: 'Ecuaciones de 2.º grado',
    explanation: () =>
      'Se calcula Δ = b² − 4ac para determinar el número y tipo de soluciones.',
    conceptual_reasoning: () =>
      'El discriminante mide cuánto "separa" la parábola del eje x.',
    algebraic_justification: () =>
      'Δ = b² − 4ac. El signo de Δ determina la naturaleza de las raíces.',
    transformation_description: () =>
      'Se evalúa numéricamente la expresión b² − 4ac.',
    educational_note: () =>
      'Δ > 0: dos raíces reales distintas. Δ = 0: raíz doble. Δ < 0: raíces complejas conjugadas.'
  },

  identify_coefficients: {
    rule_name: 'Identificación de coeficientes',
    rule_category: 'Ecuaciones de 2.º grado',
    explanation: () =>
      'Se identifican los coeficientes a, b, c de la forma estándar ax² + bx + c = 0.',
    conceptual_reasoning: () =>
      'La fórmula cuadrática requiere conocer exactamente a, b y c.',
    algebraic_justification: () =>
      'Forma estándar: ax² + bx + c = 0, con a ≠ 0.',
    transformation_description: () =>
      'Se etiquetan los coeficientes a, b, c de la ecuación cuadrática.',
    educational_note: () =>
      'Si falta el término lineal, b = 0. Si falta el término independiente, c = 0.'
  },

  square_root_both_sides: {
    rule_name: 'Raíz cuadrada en ambos miembros',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplica raíz cuadrada a ambos miembros de la ecuación.',
    conceptual_reasoning: () =>
      'Si x² = k, entonces x = ±√k. La raíz cuadrada deshace el cuadrado pero genera dos soluciones.',
    algebraic_justification: () =>
      'x² = k ⟹ |x| = √k ⟹ x = ±√k (para k ≥ 0).',
    transformation_description: () =>
      'Se extrae la raíz cuadrada en ambos lados considerando ambos signos.',
    educational_note: () =>
      'No olvides el signo ±. Si k < 0, no existen soluciones reales.'
  },

  linear_equation: {
    rule_name: 'Resolución de ecuación lineal',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplican operaciones elementales para despejar x en la ecuación lineal ax + b = c.',
    conceptual_reasoning: () =>
      'Una ecuación lineal tiene exactamente una solución si a ≠ 0.',
    algebraic_justification: () =>
      'ax + b = c ⟹ ax = c − b ⟹ x = (c − b)/a',
    transformation_description: () =>
      'Se aísla x mediante sustracción y división.',
    educational_note: () =>
      'Verifica la solución sustituyendo x en la ecuación original.'
  },

  cross_multiply: {
    rule_name: 'Multiplicación cruzada',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se multiplican en cruz los numeradores y denominadores para eliminar las fracciones.',
    conceptual_reasoning: () =>
      'Si a/b = c/d, entonces ad = bc. Esto elimina los denominadores de una sola vez.',
    algebraic_justification: () =>
      'a/b = c/d ⟺ ad = bc (multiplicamos ambos lados por bd ≠ 0).',
    transformation_description: () =>
      'Se aplica la multiplicación cruzada para obtener una ecuación sin fracciones.',
    educational_note: () =>
      'Solo es válido si los denominadores son distintos de cero. Comprueba las restricciones.'
  },

  rationalize: {
    rule_name: 'Racionalización',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se multiplica por el conjugado para eliminar radicales o números irracionales del denominador.',
    conceptual_reasoning: () =>
      '(a − b)(a + b) = a² − b². Multipliquemos por el conjugado para obtener un entero en el denominador.',
    algebraic_justification: () =>
      '1/(a + √b) · (a − √b)/(a − √b) = (a − √b)/(a² − b)',
    transformation_description: () =>
      'Se multiplica numerador y denominador por el conjugado del denominador.',
    educational_note: () =>
      'La racionalización no cambia el valor; solo reescribe la expresión sin irracionales en el denominador.'
  },

  // ── Functions ────────────────────────────────────────────────────────────

  apply_log: {
    rule_name: 'Aplicar logaritmo en ambos lados',
    rule_category: 'Logaritmos',
    explanation: () =>
      'Se aplica logaritmo a ambos miembros para bajar el exponente.',
    conceptual_reasoning: () =>
      'log(aˣ) = x·log(a). El logaritmo convierte una potencia en un producto, facilitando despejar x.',
    algebraic_justification: () =>
      'Si a = b (a, b > 0), entonces log(a) = log(b).',
    transformation_description: () =>
      'Se toma el logaritmo de ambos lados de la ecuación.',
    educational_note: () =>
      'Solo se puede aplicar logaritmos a expresiones estrictamente positivas.'
  },

  log_property: {
    rule_name: 'Propiedad de logaritmos',
    rule_category: 'Logaritmos',
    explanation: () =>
      'Se aplica una propiedad de logaritmos para simplificar o reescribir la expresión.',
    conceptual_reasoning: () =>
      'Los logaritmos convierten productos en sumas, cocientes en restas, y potencias en productos.',
    algebraic_justification: () =>
      'log(a·b) = log(a) + log(b)\nlog(a/b) = log(a) − log(b)\nlog(aⁿ) = n·log(a)',
    transformation_description: () =>
      'Se aplica la propiedad logarítmica correspondiente.',
    educational_note: () =>
      'Estas propiedades permiten convertir ecuaciones logarítmicas en ecuaciones lineales.'
  },

  exponent_property: {
    rule_name: 'Propiedad de potencias',
    rule_category: 'Álgebra',
    explanation: () =>
      'Se aplica una propiedad de las potencias para simplificar.',
    conceptual_reasoning: () =>
      'Las potencias tienen propiedades que permiten combinar o separar exponentes.',
    algebraic_justification: () =>
      'aᵐ · aⁿ = aᵐ⁺ⁿ\n(aᵐ)ⁿ = aᵐⁿ\naᵐ / aⁿ = aᵐ⁻ⁿ\na⁰ = 1',
    transformation_description: () =>
      'Se aplica la regla de exponentes correspondiente.',
    educational_note: () =>
      'Las bases deben ser iguales para aplicar las reglas de suma y resta de exponentes.'
  },

  trig_identity: {
    rule_name: 'Identidad trigonométrica',
    rule_category: 'Trigonometría',
    explanation: () =>
      'Se aplica una identidad trigonométrica para simplificar o transformar la expresión.',
    conceptual_reasoning: () =>
      'Las identidades trigonométricas son igualdades válidas para todos los ángulos.',
    algebraic_justification: () =>
      'sin²θ + cos²θ = 1\n1 + tan²θ = sec²θ\nsin(2θ) = 2sin(θ)cos(θ)',
    transformation_description: () =>
      'Se sustituye la expresión por su equivalente trigonométrico.',
    educational_note: () =>
      'Memoriza las identidades fundamentales: Pitágora, doble ángulo, y suma de ángulos.'
  },

  // ── Calculus ─────────────────────────────────────────────────────────────

  derivative_power_rule: {
    rule_name: 'Regla de la potencia',
    rule_category: 'Derivadas',
    explanation: (ctx) =>
      `Se aplica d/dx[xⁿ] = n·xⁿ⁻¹${ctx.value ? ' con n = ' + ctx.value : ''}.`,
    conceptual_reasoning: () =>
      'La regla de la potencia es la herramienta más básica de derivación.',
    algebraic_justification: () =>
      'd/dx[xⁿ] = n·xⁿ⁻¹ para n ∈ ℝ.',
    transformation_description: (ctx) =>
      `El exponente ${ctx.value || 'n'} baja como coeficiente y se reduce en 1.`,
    educational_note: () =>
      'Funciona para cualquier exponente real: enteros, fracciones, negativos.'
  },

  derivative_constant: {
    rule_name: 'Derivada de constante',
    rule_category: 'Derivadas',
    explanation: () =>
      'La derivada de una constante es cero.',
    conceptual_reasoning: () =>
      'Una constante no cambia, por lo tanto su tasa de cambio (derivada) es cero.',
    algebraic_justification: () =>
      'd/dx[k] = 0 para cualquier constante k.',
    transformation_description: () =>
      'El término constante desaparece al derivar.',
    educational_note: () =>
      'Recuerda: los términos sin la variable derivan a 0 y desaparecen.'
  },

  derivative_sum_rule: {
    rule_name: 'Regla de la suma',
    rule_category: 'Derivadas',
    explanation: () =>
      'La derivada de una suma es la suma de las derivadas.',
    conceptual_reasoning: () =>
      'La derivación es un operador lineal: se distribuye sobre sumas y diferencias.',
    algebraic_justification: () =>
      '(f + g)\'  = f\' + g\'',
    transformation_description: () =>
      'Se separa la derivada en la suma de derivadas individuales.',
    educational_note: () =>
      'Deriva cada término por separado y suma los resultados.'
  },

  derivative_product_rule: {
    rule_name: 'Regla del producto',
    rule_category: 'Derivadas',
    explanation: () =>
      'Se aplica la regla del producto: (uv)\' = u\'v + uv\'.',
    conceptual_reasoning: () =>
      'El producto de dos funciones no se deriva término a término; hay que aplicar la regla del producto.',
    algebraic_justification: () =>
      '(u·v)\' = u\'·v + u·v\'',
    transformation_description: () =>
      'Se identifican u y v, se calculan sus derivadas y se combina según la fórmula.',
    educational_note: () =>
      'Verifica cuáles son los dos factores (u y v) antes de aplicar la fórmula.'
  },

  derivative_chain_rule: {
    rule_name: 'Regla de la cadena',
    rule_category: 'Derivadas',
    explanation: () =>
      'Se aplica la regla de la cadena: (f∘g)\' = f\'(g(x)) · g\'(x).',
    conceptual_reasoning: () =>
      'Para derivar una función compuesta, derivamos la función exterior evaluada en la interior, multiplicada por la derivada de la interior.',
    algebraic_justification: () =>
      'd/dx[f(g(x))] = f\'(g(x)) · g\'(x)',
    transformation_description: () =>
      'Se identifica la función exterior f y la interior g; se aplica la cadena.',
    educational_note: () =>
      'Identifica qué es la función "exterior" y cuál es la "interior" antes de derivar.'
  },

  derivative_trig: {
    rule_name: 'Derivada de función trigonométrica',
    rule_category: 'Derivadas',
    explanation: () =>
      'Se aplica la fórmula de derivación de la función trigonométrica correspondiente.',
    conceptual_reasoning: () =>
      'Las derivadas de las funciones trigonométricas son conocidas y deben memorizarse.',
    algebraic_justification: () =>
      'd/dx[sin x] = cos x\nd/dx[cos x] = −sin x\nd/dx[tan x] = sec²x',
    transformation_description: () =>
      'Se aplica la derivada de la función trigonométrica.',
    educational_note: () =>
      'Memoriza las seis derivadas trigonométricas básicas y combínalas con la regla de la cadena.'
  },

  derivative_exp_log: {
    rule_name: 'Derivada de exponencial/logaritmo',
    rule_category: 'Derivadas',
    explanation: () =>
      'Se aplica la regla de derivación para la función exponencial o logarítmica.',
    conceptual_reasoning: () =>
      'eˣ es su propia derivada — una propiedad única de este número.',
    algebraic_justification: () =>
      'd/dx[eˣ] = eˣ\nd/dx[ln x] = 1/x',
    transformation_description: () =>
      'Se deriva la función exponencial o logarítmica.',
    educational_note: () =>
      'Para otras bases: d/dx[aˣ] = aˣ·ln(a). Para otros logaritmos: d/dx[log_a x] = 1/(x·ln a).'
  },

  integral_power_rule: {
    rule_name: 'Regla de la potencia (integral)',
    rule_category: 'Integrales',
    explanation: (ctx) =>
      `Se aplica ∫xⁿ dx = xⁿ⁺¹/(n+1) + C${ctx.value ? ' con n = ' + ctx.value : ''}.`,
    conceptual_reasoning: () =>
      'La integración es la operación inversa a la derivación. Subimos el exponente en 1 y dividimos.',
    algebraic_justification: () =>
      '∫xⁿ dx = xⁿ⁺¹/(n+1) + C, para n ≠ −1.',
    transformation_description: () =>
      'Se sube el exponente en 1 y se divide entre el nuevo exponente.',
    educational_note: () =>
      'No es válida para n = −1: en ese caso ∫(1/x) dx = ln|x| + C.'
  },

  integral_constant: {
    rule_name: 'Integral de constante',
    rule_category: 'Integrales',
    explanation: (ctx) =>
      `Se aplica ∫k dx = kx + C${ctx.value ? ' con k = ' + ctx.value : ''}.`,
    conceptual_reasoning: () =>
      'Integrar una constante equivale a multiplicarla por la variable de integración.',
    algebraic_justification: () =>
      '∫k dx = kx + C',
    transformation_description: () =>
      'La constante se multiplica por x.',
    educational_note: () =>
      'No olvides la constante de integración +C.'
  },

  integral_linearity: {
    rule_name: 'Linealidad de la integral',
    rule_category: 'Integrales',
    explanation: () =>
      'La integral de una suma es la suma de las integrales.',
    conceptual_reasoning: () =>
      'La integración es un operador lineal: se distribuye sobre sumas y sobre constantes.',
    algebraic_justification: () =>
      '∫(f + g) dx = ∫f dx + ∫g dx\n∫k·f dx = k·∫f dx',
    transformation_description: () =>
      'Se separa la integral en la suma de integrales individuales.',
    educational_note: () =>
      'Integra cada término por separado y suma los resultados.'
  },

  integral_substitution: {
    rule_name: 'Cambio de variable (sustitución)',
    rule_category: 'Integrales',
    explanation: () =>
      'Se sustituye u = g(x) para simplificar el integrando.',
    conceptual_reasoning: () =>
      'La sustitución reduce una integral compleja a una forma estándar.',
    algebraic_justification: () =>
      'Si u = g(x), entonces du = g\'(x) dx, y ∫f(g(x))g\'(x) dx = ∫f(u) du.',
    transformation_description: () =>
      'Se hace la sustitución u = g(x) y se reescribe la integral.',
    educational_note: () =>
      'Elige u de modo que du aparezca en el integrando (o pueda multiplicarse sin alterar la integral).'
  },

  integral_by_parts: {
    rule_name: 'Integración por partes',
    rule_category: 'Integrales',
    explanation: () =>
      'Se aplica ∫u dv = uv − ∫v du para integrar el producto de dos funciones.',
    conceptual_reasoning: () =>
      'La integración por partes invierte la regla del producto de la derivación.',
    algebraic_justification: () =>
      '∫u dv = uv − ∫v du',
    transformation_description: () =>
      'Se identifican u y dv; se calculan du y v; se aplica la fórmula.',
    educational_note: () =>
      'Regla LIATE para elegir u: Logaritmos > Inverso trig > Algebraica > Trig > Exponencial.'
  },

  limit_substitution: {
    rule_name: 'Sustitución directa en el límite',
    rule_category: 'Límites',
    explanation: () =>
      'Se sustituye el valor del límite directamente en la expresión.',
    conceptual_reasoning: () =>
      'Si la función es continua en el punto, el límite es simplemente el valor de la función allí.',
    algebraic_justification: () =>
      'Si f es continua en a, entonces lim_{x→a} f(x) = f(a).',
    transformation_description: () =>
      'Se sustituye x = a en la función para obtener el límite.',
    educational_note: () =>
      'Si la sustitución produce una indeterminación (0/0, ∞/∞), se necesitan técnicas adicionales.'
  },

  lhopital: {
    rule_name: 'Regla de L\'Hôpital',
    rule_category: 'Límites',
    explanation: () =>
      'Se aplica L\'Hôpital: lim f/g = lim f\'/g\' cuando la forma es 0/0 o ∞/∞.',
    conceptual_reasoning: () =>
      'En una indeterminación, la razón de las funciones tiende al mismo límite que la razón de sus derivadas.',
    algebraic_justification: () =>
      'Si lim f = lim g = 0 (o ∞), entonces lim f(x)/g(x) = lim f\'(x)/g\'(x).',
    transformation_description: () =>
      'Se derivan numerador y denominador por separado y se calcula el límite del cociente.',
    educational_note: () =>
      'Solo aplicar cuando haya indeterminación 0/0 o ∞/∞. No usar en casos sin indeterminación.'
  },

  // ── Legacy/meta ──────────────────────────────────────────────────────────

  derivative_rule: {
    rule_name: 'Regla de derivación',
    rule_category: 'Derivadas',
    explanation: () => 'Se aplica una regla de derivación para calcular la derivada de la función.',
    conceptual_reasoning: () => 'La derivada representa la tasa de cambio instantánea.',
    algebraic_justification: () => '(d/dx)[xⁿ] = n·xⁿ⁻¹\n(d/dx)[k] = 0\n(d/dx)[f+g] = f\' + g\'',
    transformation_description: () => 'Se deriva la expresión según la regla correspondiente.',
    educational_note: () => 'Domina potencia, suma, producto, cociente y cadena.'
  },

  integral_rule: {
    rule_name: 'Regla de integración',
    rule_category: 'Integrales',
    explanation: () => 'Se aplica una técnica de integración para encontrar la primitiva.',
    conceptual_reasoning: () => 'La integral es la operación inversa a la derivada.',
    algebraic_justification: () => '∫xⁿ dx = xⁿ⁺¹/(n+1) + C (para n ≠ −1)',
    transformation_description: () => 'Se integra la expresión según la técnica correspondiente.',
    educational_note: () => 'No olvides la constante de integración +C.'
  },

  unknown: {
    rule_name: 'Transformación algebraica',
    rule_category: 'Álgebra',
    explanation: () => 'Se realiza una transformación algebraica en la expresión.',
    conceptual_reasoning: () => 'Las transformaciones algebraicas preservan el valor mientras facilitan la manipulación.',
    algebraic_justification: () => 'Se aplican las propiedades de los números reales.',
    transformation_description: () => 'La expresión se transforma según las reglas del álgebra.',
    educational_note: () => 'Verifica cada paso para mantener la equivalencia.'
  }
}
