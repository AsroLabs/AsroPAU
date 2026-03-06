import type { DiffResult, TransformationType, StepAnalysis, ExplanationOutput, RuleContext } from './templates'
import { RULE_TEMPLATES } from './templates'

export function analyzeTransformation(before: string, after: string): StepAnalysis {
  const diff = computeDiff(before, after)
  const transformation = classifyTransformation(diff, before, after)
  
  return {
    before,
    after,
    diff,
    transformation
  }
}

function computeDiff(before: string, after: string): DiffResult[] {
  const results: DiffResult[] = []
  
  const beforeClean = cleanLatex(before)
  const afterClean = cleanLatex(after)
  
  const beforeTokens = tokenize(beforeClean)
  const afterTokens = tokenize(afterClean)
  
  const beforeSet = new Set(beforeTokens)
  const afterSet = new Set(afterTokens)
  
  for (const token of beforeTokens) {
    if (!afterSet.has(token)) {
      results.push({ type: 'remove', value: token, side: getSide(token, beforeClean) })
    }
  }
  
  for (const token of afterTokens) {
    if (!beforeSet.has(token)) {
      results.push({ type: 'add', value: token, side: getSide(token, afterClean) })
    }
  }
  
  for (const token of beforeTokens) {
    if (afterSet.has(token)) {
      results.push({ type: 'unchanged', value: token, side: 'both' })
    }
  }
  
  return results
}

function cleanLatex(latex: string): string {
  return latex
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\\,/g, '')
    .replace(/\\ /g, '')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .trim()
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let current = ''
  
  for (const char of expr) {
    if (/[+\-=×·÷()]/.test(char)) {
      if (current.trim()) tokens.push(current.trim())
      if (char !== ' ') tokens.push(char)
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) tokens.push(current.trim())
  
  return tokens
}

function getSide(token: string, expr: string): 'left' | 'right' | 'both' {
  const eqIndex = expr.indexOf('=')
  if (eqIndex === -1) return 'both'
  
  const tokenIndex = expr.indexOf(token)
  return tokenIndex < eqIndex ? 'left' : 'right'
}

function classifyTransformation(diff: DiffResult[], before: string, after: string): TransformationType {
  const adds = diff.filter(d => d.type === 'add')
  const removes = diff.filter(d => d.type === 'remove')
  
  const beforeClean = cleanLatex(before)
  const afterClean = cleanLatex(after)
  
  if (beforeClean.includes('log') || afterClean.includes('log')) {
    return 'log_property'
  }
  
  if (beforeClean.includes("'") || beforeClean.includes('d/dx') || beforeClean.includes('deriv')) {
    return 'derivative_rule'
  }
  
  if (beforeClean.includes('∫') || beforeClean.includes('dx') || beforeClean.includes('integral')) {
    return 'integral_rule'
  }
  
  const hasDivision = removes.some(r => r.value.match(/^\d+$/)) && 
                      (adds.some(a => a.value.includes('x') || a.value === 'x'))
  if (hasDivision) return 'divide_coefficient'
  
  const hasMultiplication = adds.some(a => a.value.match(/^\d+$/)) && 
                            removes.some(r => r.value.includes('x'))
  if (hasMultiplication) return 'multiply_coefficient'
  
  const movePattern = adds.some(a => a.value === '-') && removes.length > 0
  if (movePattern) return 'move_term'
  
  const subtractConstant = adds.some(a => a.value === '-') || 
                          (removes.length > 0 && adds.some(a => a.value.match(/^\d+$/)))
  if (subtractConstant) return 'subtract_constant'
  
  const addConstant = adds.some(a => a.value === '+') || 
                      (removes.length > 0 && adds.some(a => a.value.match(/^\d+$/)))
  if (addConstant && !subtractConstant) return 'add_constant'
  
  if (beforeClean.includes('(') && afterClean.includes(')')) {
    if (afterClean.length > beforeClean.length) return 'expand'
    if (afterClean.length < beforeClean.length) return 'factor'
  }
  
  const beforeTerms = tokenize(beforeClean).filter(t => /[a-z]/.test(t))
  const afterTerms = tokenize(afterClean).filter(t => /[a-z]/.test(t))
  if (beforeTerms.length > afterTerms.length) return 'combine_like_terms'
  
  if (afterClean.includes('√') || afterClean.includes('sqrt')) return 'square_root'
  
  if (adds.length === 0 && removes.length === 0) return 'simplify'
  
  return 'unknown'
}

export function generateExplanation(analysis: StepAnalysis): ExplanationOutput {
  const { transformation, before, after } = analysis
  
  const template = RULE_TEMPLATES[transformation] || RULE_TEMPLATES.unknown
  
  const adds = analysis.diff.filter(d => d.type === 'add')
  const removes = analysis.diff.filter(d => d.type === 'remove')
  
  const constantValue = adds.find(a => /^\d+$/.test(a.value))?.value || 
                        removes.find(r => /^\d+$/.test(r.value))?.value ||
                        adds.find(a => /^[+\-]?\d+$/.test(a.value))?.value || ''
  
  const ctx: RuleContext = {
    value: constantValue || extractsNumericValue(analysis),
    coefficient: extractsCoefficient(analysis),
    variable: 'x',
    expression: `${before} → ${after}`,
    fromSide: removes[0]?.side,
    toSide: adds[0]?.side,
    sign: adds.some(a => a.value === '-') ? '-' : '+'
  }
  
  return {
    rule_name: template.rule_name,
    rule_category: template.rule_category,
    explanation: template.explanation(ctx),
    conceptual_reasoning: template.conceptual_reasoning(ctx),
    algebraic_justification: template.algebraic_justification(ctx),
    transformation_description: template.transformation_description(ctx),
    educational_note: template.educational_note(ctx)
  }
}

function extractsNumericValue(analysis: StepAnalysis): string {
  const all = analysis.diff.map(d => d.value).join(' ')
  const nums = all.match(/[+\-]?\d+\.?\d*/g)
  return nums?.[0] || ''
}

function extractsCoefficient(analysis: StepAnalysis): string {
  const beforeClean = cleanLatex(analysis.before)
  const match = beforeClean.match(/(\d+)x/)
  return match?.[1] || '1'
}
