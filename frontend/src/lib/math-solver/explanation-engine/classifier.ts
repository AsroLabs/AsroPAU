import type { DiffResult, TransformationType, StepAnalysis, ExplanationOutput, RuleContext } from './templates'
import { RULE_TEMPLATES } from './templates'
import { diffTrees, opsOfType, extractNumericOps, extractVariableOps, parseTerm } from './ast-diff'
import type { DiffOp, ExprSide } from './ast-diff'

// ─── Public API ────────────────────────────────────────────────────────────────

export function analyzeTransformation(before: string, after: string): StepAnalysis {
  const ops = diffTrees(before, after)
  const transformation = classifyFromOps(ops, before, after)
  const diff = opsToDiffResults(ops)

  return { before, after, diff, transformation }
}

export function generateExplanation(analysis: StepAnalysis): ExplanationOutput {
  const { transformation, before, after } = analysis
  const template = RULE_TEMPLATES[transformation] ?? RULE_TEMPLATES.unknown

  const ops = diffTrees(before, after)
  const ctx = buildContext(ops, before, after)

  return {
    rule_name:                template.rule_name,
    rule_category:            template.rule_category,
    explanation:              template.explanation(ctx),
    conceptual_reasoning:     template.conceptual_reasoning(ctx),
    algebraic_justification:  template.algebraic_justification(ctx),
    transformation_description: template.transformation_description(ctx),
    educational_note:         template.educational_note(ctx),
  }
}

// ─── DiffOp → DiffResult (legacy compat) ──────────────────────────────────────

function opsToDiffResults(ops: DiffOp[]): DiffResult[] {
  return ops.map(op => ({
    type:  op.type === 'move' ? 'add' : (op.type as 'add' | 'remove' | 'replace' | 'unchanged'),
    value: op.node.value ?? op.node.raw,
    side:  (op.side === 'none' ? 'both' : op.side) as 'left' | 'right' | 'both',
  }))
}

// ─── Context builder ───────────────────────────────────────────────────────────

function buildContext(ops: DiffOp[], before: string, after: string): RuleContext {
  const numericAdds    = extractNumericOps(ops, 'add')
  const numericRemoves = extractNumericOps(ops, 'remove')
  const varOps         = extractVariableOps(ops, 'remove')
  const movedOps       = opsOfType(ops, 'move')

  const value =
    numericAdds[0]?.node.value ??
    numericRemoves[0]?.node.value ??
    ''

  const coefficient = (() => {
    // Look for removed product node: e.g. "3x" is a product of atom:3 and atom:x
    const coeffAtom = opsOfType(ops, 'remove').find(
      op => op.node.kind === 'atom' && /^\d+$/.test(op.node.value ?? '')
    )
    return coeffAtom?.node.value ?? '1'
  })()

  const termMoved = movedOps[0]?.node.raw ?? varOps[0]?.node.raw ?? undefined

  return {
    value,
    coefficient,
    variable: 'x',
    expression: `${before} → ${after}`,
    fromSide: movedOps[0]?.side as 'left' | 'right' | undefined,
    toSide:   movedOps[0] ? (movedOps[0].side === 'left' ? 'right' : 'left') as 'left' | 'right' : undefined,
    sign:     opsOfType(ops, 'add').some(op => op.node.sign === '-') ? '-' : '+',
    termMoved,
  }
}

// ─── Core classifier ──────────────────────────────────────────────────────────
//
// Priority-ordered rules: first match wins.
// Each rule takes the full DiffOp[] and the raw LaTeX strings.

function classifyFromOps(ops: DiffOp[], before: string, after: string): TransformationType {
  const beforeLow = before.toLowerCase()
  const afterLow  = after.toLowerCase()

  // ── Calculus heuristics (check before algebra to avoid mis-classification) ──

  if (/\\frac\s*\{d/.test(before) || /d\/dx/.test(beforeLow) || /deriv/.test(beforeLow) ||
      /'/.test(before)) {
    if (/x\^/.test(before) || /\^/.test(before)) return 'derivative_power_rule'
    if (/sin|cos|tan|sec|csc|cot/.test(beforeLow)) return 'derivative_trig'
    if (/e\^|\\exp|ln|\\log/.test(before)) return 'derivative_exp_log'
    if (/\\cdot|\\times|\*/.test(before)) return 'derivative_product_rule'
    return 'derivative_rule'
  }

  if (/\\int|\\displaystyle\\int/.test(before)) {
    if (/x\^/.test(before) || /\^/.test(before)) return 'integral_power_rule'
    if (/\\cdot|\\times|u\s*dv/i.test(before)) return 'integral_by_parts'
    if (/\\text\{?d\}?\s*u|du/.test(after)) return 'integral_substitution'
    if (/k|[0-9]/.test(before)) return 'integral_constant'
    return 'integral_rule'
  }

  if (/\\lim/.test(before)) {
    if (/'/.test(after) || /L'H/.test(after)) return 'lhopital'
    return 'limit_substitution'
  }

  // ── Log / Exponent ────────────────────────────────────────────────────────

  if (/\\log|\\ln/.test(before) || /\\log|\\ln/.test(after)) {
    if (/\\log/.test(before) && /\\log/.test(after)) return 'log_property'
    if (/\\log/.test(after)) return 'apply_log'
    return 'log_property'
  }

  if (/\^/.test(before) && /\^/.test(after)) {
    if (countChar(after, '^') < countChar(before, '^')) return 'exponent_property'
  }

  // ── Trig ──────────────────────────────────────────────────────────────────

  if (/sin|cos|tan|sec|csc|cot/.test(beforeLow) || /sin|cos|tan|sec|csc|cot/.test(afterLow)) {
    return 'trig_identity'
  }

  // ── Structural ops ────────────────────────────────────────────────────────

  const adds     = opsOfType(ops, 'add')
  const removes  = opsOfType(ops, 'remove')
  const moves    = opsOfType(ops, 'move')
  const unchanged = opsOfType(ops, 'unchanged')

  // Term moved across = sign
  if (moves.length > 0) {
    const movedSide = moves[0].side
    if (movedSide === 'right') return 'move_term_left'
    if (movedSide === 'left')  return 'move_term_right'
    return 'move_term'
  }

  const numAdds    = extractNumericOps(ops, 'add')
  const numRemoves = extractNumericOps(ops, 'remove')
  const varAdds    = extractVariableOps(ops, 'add')
  const varRemoves = extractVariableOps(ops, 'remove')

  // ── Square root application ───────────────────────────────────────────────

  if (/sqrt|\\sqrt/.test(afterLow) && !/sqrt|\\sqrt/.test(beforeLow)) {
    return 'square_root_both_sides'
  }

  // ── Quadratic-specific ────────────────────────────────────────────────────

  if (/\\frac\{-b/.test(after) || /frac.*pm.*sqrt.*4ac/i.test(after)) {
    return 'quadratic_formula'
  }

  if (/\\Delta|b\^2\s*-\s*4/.test(after)) return 'compute_discriminant'

  if (/a\s*=|b\s*=|c\s*=/.test(after) && /\^2/.test(before)) {
    return 'identify_coefficients'
  }

  if (/\\pm/.test(after)) return 'square_root_both_sides'

  if (/f\(x\)\s*-\s*g\(x\)|=\s*0$/.test(after) && !/=\s*0$/.test(before)) {
    return 'rewrite_as_zero'
  }

  // ── Factoring / expanding ─────────────────────────────────────────────────

  const beforeParens = countChar(before, '(')
  const afterParens  = countChar(after,  '(')

  if (afterParens > beforeParens && before.includes('^2')) return 'complete_the_square'

  if (beforeParens > afterParens) {
    // More parens before → we expanded
    if (/\(.*\+.*\).*\(.*\+.*\)/.test(before)) return 'expand_binomial'
    return 'expand'
  }

  if (afterParens > beforeParens) {
    // More parens after → we factored
    if (/\^2.*-.*\^2/.test(before)) return 'factor_difference_squares'
    if (/\^2/.test(before)) return 'factor_quadratic'
    return 'factor_common'
  }

  // ── Cross multiply ────────────────────────────────────────────────────────

  if (/\\frac/.test(before) && !/\\frac/.test(after) && before.includes('=')) {
    return 'cross_multiply'
  }

  // ── Rationalize ──────────────────────────────────────────────────────────

  if (/sqrt/.test(before) && !/sqrt/.test(after) && /\\frac/.test(before)) {
    return 'rationalize'
  }

  // ── Simplify fraction ─────────────────────────────────────────────────────

  if (/\\frac/.test(before) && /\\frac/.test(after)) {
    return 'simplify_fraction'
  }

  // ── No-change simplifications (both have =) ───────────────────────────────

  const hasEq = before.includes('=') && after.includes('=')

  if (hasEq) {
    // Variables appear on both sides in before, but only one side in after
    const beforeVarLeft  = hasVarOnSide(before, 'left')
    const beforeVarRight = hasVarOnSide(before, 'right')
    const afterVarLeft   = hasVarOnSide(after,  'left')
    const afterVarRight  = hasVarOnSide(after,  'right')

    if ((beforeVarLeft && beforeVarRight) && (!afterVarLeft || !afterVarRight)) {
      return 'collect_variable_terms'
    }

    // Coefficient in front of variable removed
    if (varAdds.length === 0 && varRemoves.length === 0 && numRemoves.length > 0) {
      return 'divide_coefficient'
    }

    // Constant on variable side removed
    if (numRemoves.length > 0 && numAdds.length > 0) {
      const removeSide = numRemoves[0].side
      const addSide    = numAdds[0].side
      if (removeSide !== addSide) return 'transpose_term'
      const addVal = parseFloat(numAdds[0].node.value ?? '0')
      if (addVal < 0 || numAdds.some(a => a.node.sign === '-')) return 'subtract_constant'
      return 'add_constant'
    }

    if (numRemoves.length > 0 && numAdds.length === 0) return 'subtract_constant'
    if (numAdds.length > 0 && numRemoves.length === 0) return 'add_constant'

    // Variable term count decreased on one side
    if (varRemoves.length > varAdds.length) return 'combine_like_terms'

    // Only variable left on one side
    if (
      unchanged.length > 0 &&
      adds.length === 0 &&
      removes.length === 0
    ) return 'isolate_variable'
  }

  // ── No = sign: expression simplification ─────────────────────────────────

  if (!before.includes('=')) {
    if (varRemoves.length > varAdds.length) return 'combine_like_terms'
    if (numRemoves.length > 0 && numAdds.length > 0) return 'evaluate_arithmetic'
    if (after.length < before.length) return 'simplify'
  }

  // ── Evaluate arithmetic (both sides change numerically) ───────────────────

  if (numRemoves.length > 0 && numAdds.length > 0) return 'evaluate_arithmetic'

  if (adds.length === 0 && removes.length === 0) return 'simplify'

  return 'unknown'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countChar(str: string, ch: string): number {
  let n = 0
  for (const c of str) if (c === ch) n++
  return n
}

function hasVarOnSide(latex: string, side: 'left' | 'right'): boolean {
  const eqIdx = latex.indexOf('=')
  if (eqIdx === -1) return false
  const part = side === 'left' ? latex.slice(0, eqIdx) : latex.slice(eqIdx + 1)
  return /[a-z]/i.test(part.replace(/\\[a-z]+/g, ''))
}
