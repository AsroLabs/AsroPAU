/**
 * ast-diff.ts
 *
 * Lightweight structural diff for algebraic LaTeX expressions.
 *
 * Pipeline:
 *   LaTeX string
 *   → cleanLatex (normalize symbols)
 *   → parseTerm  (build TermNode tree: equation | sum | product | power | func | atom)
 *   → diffTrees  (tree edit distance → DiffOp[])
 *
 * This replaces the token-set diff that missed duplicates and structure.
 */

// ─── Term AST ─────────────────────────────────────────────────────────────────

export type TermKind =
  | 'equation'   // lhs = rhs
  | 'sum'        // a + b + ... (signed terms list)
  | 'product'    // a * b * ...
  | 'power'      // base ^ exp
  | 'fraction'   // num / den
  | 'func'       // sin, cos, log, sqrt, ...
  | 'atom'       // number or variable leaf

export interface TermNode {
  kind: TermKind
  raw: string          // original LaTeX substring this node represents
  value?: string       // for atom: the literal value ("2", "x", "3.14", "-1")
  sign?: '+' | '-'     // sign of this term inside a sum (default '+')
  children: TermNode[]
}

// ─── DiffOp ────────────────────────────────────────────────────────────────────

export type DiffOpType = 'add' | 'remove' | 'replace' | 'move' | 'unchanged'
export type ExprSide   = 'left' | 'right' | 'both' | 'none'

export interface DiffOp {
  type:    DiffOpType
  node:    TermNode           // the node that was added/removed/replaced/moved
  newNode?: TermNode          // for 'replace': what it became
  side:    ExprSide           // which side of the equation it was on
  depth:   number             // tree depth — 0 = root, 1 = direct child, etc.
}

// ─── LaTeX normalizer ──────────────────────────────────────────────────────────

function cleanLatex(latex: string): string {
  return latex
    .replace(/\\textcolor\{[^}]*\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\left\s*/g, '')
    .replace(/\\right\s*/g, '')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\,/g, '')
    .replace(/\\ /g, ' ')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Tokenizer ─────────────────────────────────────────────────────────────────
// Produces structured tokens rather than a flat array of chars.

type TokType = 'num' | 'var' | 'op' | 'lparen' | 'rparen' | 'func' | 'eq' | 'ws'

interface Tok {
  type: TokType
  value: string
}

const FUNC_NAMES = new Set(['sin','cos','tan','cot','sec','csc','log','ln','exp','sqrt','abs','lim','det','arcsin','arccos','arctan'])

function tokenize(expr: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (ch === ' ') { i++; continue }
    if (ch === '=') { toks.push({ type: 'eq', value: '=' }); i++; continue }
    if (ch === '(') { toks.push({ type: 'lparen', value: '(' }); i++; continue }
    if (ch === ')') { toks.push({ type: 'rparen', value: ')' }); i++; continue }
    if ('+-*/^'.includes(ch)) { toks.push({ type: 'op', value: ch }); i++; continue }
    // Number (including decimals)
    if (/\d/.test(ch) || (ch === '.' && i + 1 < expr.length && /\d/.test(expr[i+1]))) {
      let num = ''
      while (i < expr.length && /[\d.]/.test(expr[i])) num += expr[i++]
      toks.push({ type: 'num', value: num })
      continue
    }
    // Identifier (variable or function name)
    if (/[a-zA-Z_]/.test(ch)) {
      let name = ''
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) name += expr[i++]
      if (FUNC_NAMES.has(name.toLowerCase())) {
        toks.push({ type: 'func', value: name.toLowerCase() })
      } else {
        toks.push({ type: 'var', value: name })
      }
      continue
    }
    i++ // skip unknown chars
  }
  return toks
}

// ─── Recursive descent parser ──────────────────────────────────────────────────
// Grammar (simplified):
//   equation := sum '=' sum
//   sum      := signed_product (('+'|'-') signed_product)*
//   product  := power ('*' power)*
//   power    := unary ('^' unary)?
//   unary    := '-'? atom
//   atom     := NUM | VAR | FUNC '(' sum ')' | '(' sum ')'

class Parser {
  private pos = 0
  constructor(private readonly toks: Tok[]) {}

  private peek(): Tok | null { return this.toks[this.pos] ?? null }
  private consume(): Tok { return this.toks[this.pos++] }
  private expect(type: TokType, value?: string): Tok {
    const t = this.consume()
    if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${type}${value ? ' ' + value : ''}, got ${t?.value ?? 'EOF'}`)
    }
    return t
  }
  private check(type: TokType, value?: string): boolean {
    const t = this.peek()
    return !!t && t.type === type && (value === undefined || t.value === value)
  }

  parseEquation(): TermNode {
    const lhs = this.parseSum()
    if (this.check('eq')) {
      this.consume()
      const rhs = this.parseSum()
      return { kind: 'equation', raw: `${lhs.raw}=${rhs.raw}`, children: [lhs, rhs] }
    }
    return lhs
  }

  parseSum(): TermNode {
    const terms: TermNode[] = []
    // Leading sign
    let sign: '+' | '-' = '+'
    if (this.check('op', '-')) { this.consume(); sign = '-' }
    else if (this.check('op', '+')) { this.consume() }
    let term = this.parseProduct()
    term.sign = sign
    terms.push(term)

    while (this.check('op', '+') || this.check('op', '-')) {
      const op = this.consume()
      const s: '+' | '-' = op.value as '+' | '-'
      const t = this.parseProduct()
      t.sign = s
      terms.push(t)
    }

    if (terms.length === 1) return terms[0]
    const raw = terms.map((t, i) => (i === 0 && t.sign === '+' ? '' : t.sign) + t.raw).join('')
    return { kind: 'sum', raw, children: terms }
  }

  parseProduct(): TermNode {
    const factors: TermNode[] = []
    factors.push(this.parsePower())
    while (this.check('op', '*')) {
      this.consume()
      factors.push(this.parsePower())
    }
    if (factors.length === 1) return factors[0]
    const raw = factors.map(f => f.raw).join('*')
    return { kind: 'product', raw, children: factors }
  }

  parsePower(): TermNode {
    const base = this.parseUnary()
    if (this.check('op', '^')) {
      this.consume()
      const exp = this.parseUnary()
      return { kind: 'power', raw: `${base.raw}^${exp.raw}`, children: [base, exp] }
    }
    return base
  }

  parseUnary(): TermNode {
    // Allow implicit negation at unary level (rare after parseSum handles it, but safe)
    if (this.check('op', '-')) {
      this.consume()
      const inner = this.parseAtom()
      return { kind: 'atom', raw: `-${inner.raw}`, value: `-${inner.value ?? inner.raw}`, sign: '-', children: [] }
    }
    return this.parseAtom()
  }

  parseAtom(): TermNode {
    const t = this.peek()
    if (!t) throw new Error('Unexpected end of expression')

    // Number
    if (t.type === 'num') {
      this.consume()
      return { kind: 'atom', raw: t.value, value: t.value, children: [] }
    }

    // Variable
    if (t.type === 'var') {
      this.consume()
      // Implicit multiplication: x2, xy, 2x all tokenized as adjacent — handled at product level
      return { kind: 'atom', raw: t.value, value: t.value, children: [] }
    }

    // Function call
    if (t.type === 'func') {
      const name = this.consume().value
      this.expect('lparen')
      const arg = this.parseSum()
      this.expect('rparen')
      return { kind: 'func', raw: `${name}(${arg.raw})`, value: name, children: [arg] }
    }

    // Parenthesized expression
    if (t.type === 'lparen') {
      this.consume()
      const inner = this.parseSum()
      this.expect('rparen')
      return { ...inner, raw: `(${inner.raw})` }
    }

    // Fallback: consume whatever and return atom
    this.consume()
    return { kind: 'atom', raw: t.value, value: t.value, children: [] }
  }
}

export function parseTerm(latex: string): TermNode {
  try {
    const clean = cleanLatex(latex)
    const toks = tokenize(clean)
    if (toks.length === 0) return { kind: 'atom', raw: '', value: '', children: [] }
    const parser = new Parser(toks)
    return parser.parseEquation()
  } catch {
    // Parsing failed — return opaque atom so diff degrades gracefully
    return { kind: 'atom', raw: cleanLatex(latex), value: cleanLatex(latex), children: [] }
  }
}

// ─── Tree differ ───────────────────────────────────────────────────────────────

function nodeKey(n: TermNode): string {
  if (n.kind === 'atom') return `atom:${n.value ?? n.raw}`
  if (n.kind === 'func') return `func:${n.value}(${n.children.map(nodeKey).join(',')})`
  return `${n.kind}:${n.children.map(nodeKey).join('|')}`
}

function sideOf(node: TermNode, root: TermNode): ExprSide {
  if (root.kind !== 'equation') return 'both'
  const inLeft  = containsNode(root.children[0], node)
  const inRight = containsNode(root.children[1], node)
  if (inLeft && inRight) return 'both'
  if (inLeft)  return 'left'
  if (inRight) return 'right'
  return 'none'
}

function containsNode(tree: TermNode, target: TermNode): boolean {
  if (nodeKey(tree) === nodeKey(target)) return true
  return tree.children.some(c => containsNode(c, target))
}

/**
 * Collect all leaf/term-level nodes from a tree at a given depth.
 * We collect atoms + funcs + powers + products as "meaningful diff units".
 */
function collectNodes(node: TermNode, depth = 0): Array<{ node: TermNode; depth: number }> {
  const results: Array<{ node: TermNode; depth: number }> = []
  if (node.kind === 'equation') {
    // Don't collect the equation root itself — descend both sides
    for (const child of node.children) {
      results.push(...collectNodes(child, depth + 1))
    }
    return results
  }
  if (node.kind === 'sum') {
    // Each term of the sum is a meaningful diff unit
    for (const child of node.children) {
      results.push({ node: child, depth })
      // But also descend into non-atom children for sub-term diffs
      if (child.kind !== 'atom') {
        results.push(...collectNodes(child, depth + 1))
      }
    }
    return results
  }
  results.push({ node, depth })
  if (node.kind !== 'atom') {
    for (const child of node.children) {
      results.push(...collectNodes(child, depth + 1))
    }
  }
  return results
}

export function diffTrees(beforeLatex: string, afterLatex: string): DiffOp[] {
  const beforeTree = parseTerm(beforeLatex)
  const afterTree  = parseTerm(afterLatex)

  const beforeNodes = collectNodes(beforeTree)
  const afterNodes  = collectNodes(afterTree)

  const beforeKeys = new Map<string, { node: TermNode; depth: number }[]>()
  const afterKeys  = new Map<string, { node: TermNode; depth: number }[]>()

  for (const item of beforeNodes) {
    const k = nodeKey(item.node)
    if (!beforeKeys.has(k)) beforeKeys.set(k, [])
    beforeKeys.get(k)!.push(item)
  }
  for (const item of afterNodes) {
    const k = nodeKey(item.node)
    if (!afterKeys.has(k)) afterKeys.set(k, [])
    afterKeys.get(k)!.push(item)
  }

  const ops: DiffOp[] = []

  // Removed nodes: in before but not in after (or fewer occurrences)
  for (const [key, bItems] of beforeKeys) {
    const aItems = afterKeys.get(key) ?? []
    const removedCount = Math.max(0, bItems.length - aItems.length)
    for (let i = 0; i < removedCount; i++) {
      ops.push({
        type:  'remove',
        node:  bItems[i].node,
        side:  sideOf(bItems[i].node, beforeTree),
        depth: bItems[i].depth,
      })
    }
  }

  // Added nodes: in after but not in before (or more occurrences)
  for (const [key, aItems] of afterKeys) {
    const bItems = beforeKeys.get(key) ?? []
    const addedCount = Math.max(0, aItems.length - bItems.length)
    for (let i = 0; i < addedCount; i++) {
      ops.push({
        type:  'add',
        node:  aItems[i].node,
        side:  sideOf(aItems[i].node, afterTree),
        depth: aItems[i].depth,
      })
    }
  }

  // Unchanged nodes
  for (const [key, bItems] of beforeKeys) {
    const aItems = afterKeys.get(key) ?? []
    const unchangedCount = Math.min(bItems.length, aItems.length)
    for (let i = 0; i < unchangedCount; i++) {
      const bSide = sideOf(bItems[i].node, beforeTree)
      const aSide = sideOf(aItems[i].node, afterTree)
      if (bSide !== aSide) {
        // Same term appeared on opposite side → it moved
        ops.push({
          type:  'move',
          node:  bItems[i].node,
          side:  bSide,
          depth: bItems[i].depth,
        })
      } else {
        ops.push({
          type:  'unchanged',
          node:  bItems[i].node,
          side:  bSide,
          depth: bItems[i].depth,
        })
      }
    }
  }

  return ops
}

// ─── Convenience accessors ─────────────────────────────────────────────────────

export function opsOfType(ops: DiffOp[], type: DiffOpType): DiffOp[] {
  return ops.filter(op => op.type === type)
}

export function hasAtomValue(ops: DiffOp[], type: DiffOpType, value: string): boolean {
  return opsOfType(ops, type).some(op => op.node.kind === 'atom' && op.node.value === value)
}

export function extractNumericOps(ops: DiffOp[], type: DiffOpType): DiffOp[] {
  return opsOfType(ops, type).filter(op => op.node.kind === 'atom' && /^[+\-]?\d+\.?\d*$/.test(op.node.value ?? ''))
}

export function extractVariableOps(ops: DiffOp[], type: DiffOpType, varName = 'x'): DiffOp[] {
  return opsOfType(ops, type).filter(op =>
    op.node.kind === 'atom' && (op.node.value ?? '').includes(varName)
  )
}
