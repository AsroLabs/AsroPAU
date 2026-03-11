/**
 * animation-engine/mapper.ts
 *
 * Maps a (TransformationType, DiffOp[]) pair into a sequence of AnimationOps.
 *
 * AnimationOp types (matching the spec):
 *   highlight_term    – flash/glow the node in place
 *   move_term         – slide the node from one side of the = to the other
 *   fade_out          – dissolve a node that is being cancelled/removed
 *   rewrite_expression – replace a sub-expression with its rewritten form
 *   simplify_number   – animate a numeric computation (e.g. 2+3 → 5)
 */

import type { TransformationType } from '../explanation/templates'
import type { DiffOp, ExprSide } from '../explanation/ast-diff'
import { opsOfType, extractNumericOps, extractVariableOps } from '../explanation/ast-diff'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AnimationOpType =
  | 'highlight_term'
  | 'move_term'
  | 'fade_out'
  | 'rewrite_expression'
  | 'simplify_number'

export interface AnimationOp {
  type: AnimationOpType
  /** The LaTeX fragment / node raw text being animated */
  node: string
  /** For move_term: where it was */
  from?: ExprSide
  /** For move_term: where it goes */
  to?: ExprSide
  /** Duration in milliseconds */
  duration: number
  /** Optional metadata for the renderer */
  meta?: Record<string, string>
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Given the semantic classification of a step and its structural diff,
 * produce an ordered list of AnimationOps that describe the visual transformation.
 */
export function mapTransformationToAnimation(
  type: TransformationType,
  ops: DiffOp[]
): AnimationOp[] {
  const adds     = opsOfType(ops, 'add')
  const removes  = opsOfType(ops, 'remove')
  const moves    = opsOfType(ops, 'move')
  const numAdds  = extractNumericOps(ops, 'add')
  const numRems  = extractNumericOps(ops, 'remove')

  switch (type) {

    // ── Equation operations ────────────────────────────────────────────────

    case 'subtract_constant':
    case 'add_constant': {
      const target = numRems[0]?.node.raw ?? removes[0]?.node.raw ?? ''
      const result = numAdds[0]?.node.raw ?? adds[0]?.node.raw ?? ''
      return [
        highlight(target, 400),
        fadeOut(target, 300),
        ...(result ? [rewrite(result, 350)] : []),
      ]
    }

    case 'divide_coefficient':
    case 'divide_both_sides': {
      const coeff = numRems[0]?.node.raw ?? removes[0]?.node.raw ?? ''
      return [
        highlight(coeff, 400),
        simplifyNumber(coeff, adds[0]?.node.raw ?? '', 500),
      ]
    }

    case 'multiply_coefficient':
    case 'multiply_both_sides': {
      const factor = numAdds[0]?.node.raw ?? adds[0]?.node.raw ?? ''
      return [
        highlight(factor, 400),
        rewrite(factor, 400),
      ]
    }

    // ── Term movement ──────────────────────────────────────────────────────

    case 'move_term':
    case 'move_term_left':
    case 'move_term_right':
    case 'transpose_term': {
      if (moves.length > 0) {
        return moves.map(m => moveTerm(
          m.node.raw,
          m.side,
          m.side === 'left' ? 'right' : 'left',
          600
        ))
      }
      // Fallback: add removes as fade-out + adds as rewrite
      return [
        ...removes.map(r => fadeOut(r.node.raw, 300)),
        ...adds.map(a => rewrite(a.node.raw, 400)),
      ]
    }

    // ── Simplification ────────────────────────────────────────────────────

    case 'combine_like_terms':
    case 'collect_variable_terms': {
      const varRems = extractVariableOps(ops, 'remove')
      return [
        ...varRems.map(v => highlight(v.node.raw, 350)),
        ...varRems.map(v => fadeOut(v.node.raw, 300)),
        ...(adds.length > 0 ? [rewrite(adds[0].node.raw, 400)] : []),
      ]
    }

    case 'cancel_terms': {
      return removes.map(r => fadeOut(r.node.raw, 400))
    }

    case 'evaluate_arithmetic':
    case 'simplify_number':
    case 'zero_product': {
      const from = numRems.map(n => n.node.raw).join(' ')
      const to   = numAdds.map(n => n.node.raw).join(' ')
      return from ? [simplifyNumber(from, to, 500)] : [rewrite(to || '', 400)]
    }

    case 'simplify':
    case 'simplify_fraction':
    case 'simplify_expression': {
      return [
        ...removes.map(r => highlight(r.node.raw, 250)),
        ...removes.map(r => fadeOut(r.node.raw, 300)),
        ...adds.map(a => rewrite(a.node.raw, 350)),
      ]
    }

    case 'isolate_variable': {
      const varNode = adds.find(a => /[a-z]/i.test(a.node.value ?? ''))?.node.raw ?? ''
      return [
        ...(varNode ? [highlight(varNode, 400)] : []),
        rewrite(adds[0]?.node.raw ?? '', 400),
      ]
    }

    // ── Structure ─────────────────────────────────────────────────────────

    case 'expand':
    case 'expand_binomial': {
      const paren = removes.find(r => r.node.raw.startsWith('('))?.node.raw
        ?? removes[0]?.node.raw ?? ''
      return [
        highlight(paren, 350),
        rewrite(adds.map(a => a.node.raw).join(' + '), 500),
      ]
    }

    case 'factor':
    case 'factor_common':
    case 'factor_quadratic':
    case 'factor_difference_squares': {
      return [
        ...removes.map(r => highlight(r.node.raw, 250)),
        rewrite(adds.map(a => a.node.raw).join(''), 500),
      ]
    }

    case 'complete_the_square': {
      return [
        ...removes.map(r => highlight(r.node.raw, 300)),
        rewrite(adds.map(a => a.node.raw).join(''), 550),
      ]
    }

    case 'rewrite_as_zero': {
      return [rewrite('0', 400)]
    }

    // ── Equations ─────────────────────────────────────────────────────────

    case 'quadratic_formula': {
      return [rewrite('\\frac{-b \\pm \\sqrt{\\Delta}}{2a}', 600)]
    }

    case 'compute_discriminant': {
      return [
        highlight('b^2 - 4ac', 400),
        simplifyNumber('b^2 - 4ac', numAdds[0]?.node.raw ?? '', 500),
      ]
    }

    case 'identify_coefficients': {
      return [
        highlight('a', 250),
        highlight('b', 250),
        highlight('c', 250),
      ]
    }

    case 'square_root_both_sides': {
      return [
        rewrite('\\pm\\sqrt{\\cdot}', 450),
      ]
    }

    case 'linear_equation': {
      return [
        ...removes.map(r => fadeOut(r.node.raw, 300)),
        ...adds.map(a => rewrite(a.node.raw, 350)),
      ]
    }

    case 'cross_multiply': {
      return [
        highlight('\\frac{\\cdot}{\\cdot}', 400),
        rewrite(adds.map(a => a.node.raw).join(' = '), 500),
      ]
    }

    case 'rationalize': {
      return [rewrite(adds[0]?.node.raw ?? '', 450)]
    }

    // ── Logarithms / exponents ────────────────────────────────────────────

    case 'apply_log': {
      return [rewrite('\\log(\\cdot)', 400)]
    }

    case 'log_property':
    case 'exponent_property':
    case 'trig_identity': {
      return [
        ...removes.map(r => highlight(r.node.raw, 300)),
        rewrite(adds[0]?.node.raw ?? '', 450),
      ]
    }

    // ── Calculus ─────────────────────────────────────────────────────────

    case 'derivative_power_rule':
    case 'derivative_constant':
    case 'derivative_sum_rule':
    case 'derivative_product_rule':
    case 'derivative_chain_rule':
    case 'derivative_trig':
    case 'derivative_exp_log':
    case 'derivative_rule': {
      return [
        ...removes.map(r => highlight(r.node.raw, 300)),
        rewrite(adds[0]?.node.raw ?? '', 450),
      ]
    }

    case 'integral_power_rule':
    case 'integral_constant':
    case 'integral_linearity':
    case 'integral_substitution':
    case 'integral_by_parts':
    case 'integral_rule': {
      return [
        ...removes.map(r => highlight(r.node.raw, 300)),
        rewrite(adds[0]?.node.raw ?? '', 450),
      ]
    }

    case 'limit_substitution': {
      return [
        highlight(removes[0]?.node.raw ?? 'x', 300),
        rewrite(adds[0]?.node.raw ?? '', 400),
      ]
    }

    case 'lhopital': {
      return [
        highlight('\\frac{f}{g}', 350),
        rewrite("\\frac{f'}{g'}", 500),
      ]
    }

    // ── Fallback ─────────────────────────────────────────────────────────

    case 'unknown':
    default: {
      const allChanged = [...removes, ...adds]
      if (allChanged.length === 0) return [rewrite('', 300)]
      return [
        ...removes.map(r => highlight(r.node.raw, 250)),
        ...removes.map(r => fadeOut(r.node.raw, 300)),
        ...adds.map(a => rewrite(a.node.raw, 350)),
      ]
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function highlight(node: string, duration: number): AnimationOp {
  return { type: 'highlight_term', node, duration }
}

function fadeOut(node: string, duration: number): AnimationOp {
  return { type: 'fade_out', node, duration }
}

function rewrite(node: string, duration: number): AnimationOp {
  return { type: 'rewrite_expression', node, duration }
}

function simplifyNumber(from: string, to: string, duration: number): AnimationOp {
  return { type: 'simplify_number', node: from, meta: { result: to }, duration }
}

function moveTerm(node: string, from: ExprSide, to: ExprSide, duration: number): AnimationOp {
  return { type: 'move_term', node, from, to, duration }
}
