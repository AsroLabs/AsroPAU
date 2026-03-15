/**
 * Semantic color palette for math-solver steps.
 * These colors are used in the frontend to represent different types of operations and transformations.
 */

export const COLORS = {
	ACTIVE: '#EA580C', // orange — term being operated / active rule
	CONST: '#2563EB', // blue — constants / coefficients
	RESULT: '#16A34A', // green — result / simplified form
	REMOVE: '#DC2626', // red — term that disappears / moves sides
	CTX: '#6B7280', // gray — context that doesn't change
} as const;

/**
 * Maps rule names to their semantic colors.
 * This determines which color highlight is used for each type of mathematical operation.
 */
export function getRuleColor(ruleName?: string): string {
	if (!ruleName) return COLORS.ACTIVE;

	const ruleColorMap: Record<string, string> = {
		// Algebraic rules
		'Reorganizar': COLORS.ACTIVE,
		'Factorización': COLORS.CONST,
		'Cuadrática': COLORS.CONST,
		'Discriminante': COLORS.ACTIVE,
		'Fórmula': COLORS.ACTIVE,
		'Sin solución': COLORS.REMOVE,
		'Lineal': COLORS.ACTIVE,
		'Cúbica': COLORS.ACTIVE,
		'Solución': COLORS.RESULT,

		// Derivative rules
		'Suma': COLORS.ACTIVE,
		'Constante': COLORS.CONST,
		'Producto': COLORS.ACTIVE,
		'Potencia': COLORS.ACTIVE,
		'Cadena': COLORS.ACTIVE,
		'Trig': COLORS.ACTIVE,
		'Logaritmo': COLORS.ACTIVE,
		'Exponencial': COLORS.ACTIVE,
		'Derivada': COLORS.ACTIVE,
		'Resultado': COLORS.RESULT,
		'Simplificar': COLORS.RESULT,

		// Integral rules
		'Linealidad': COLORS.ACTIVE,
		'Por partes': COLORS.ACTIVE,
		'Integración': COLORS.ACTIVE,

		// Limit rules
		'Sustitución': COLORS.RESULT,
		'Indeterminada': COLORS.REMOVE,
		"L'Hôpital": COLORS.ACTIVE,
	};

	return ruleColorMap[ruleName] || COLORS.ACTIVE;
}

/**
 * Maps colors to Tailwind CSS classes for UI styling.
 */
export function rulePillClasses(color?: string): string {
	const colorMap: Record<string, string> = {
		[COLORS.ACTIVE]: 'bg-orange-100 text-orange-700',
		[COLORS.CONST]: 'bg-blue-100 text-blue-700',
		[COLORS.RESULT]: 'bg-green-100 text-green-700',
		[COLORS.REMOVE]: 'bg-red-100 text-red-700',
		[COLORS.CTX]: 'bg-gray-100 text-gray-700',
	};

	return colorMap[color || COLORS.ACTIVE] || 'bg-orange-100 text-orange-700';
}
