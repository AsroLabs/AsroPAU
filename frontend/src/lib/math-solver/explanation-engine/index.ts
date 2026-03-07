export { analyzeTransformation, generateExplanation } from './classifier'
export type { ExplanationOutput, StepAnalysis, DiffResult, TransformationType } from './templates'
export { RULE_TEMPLATES } from './templates'

// AST diff primitives (re-exported for animation engine and external use)
export type { TermNode, TermKind, DiffOp, DiffOpType, ExprSide } from './ast-diff'
export { parseTerm, diffTrees, opsOfType, extractNumericOps, extractVariableOps } from './ast-diff'
