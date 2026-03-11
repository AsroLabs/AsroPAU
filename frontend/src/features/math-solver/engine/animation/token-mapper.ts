/**
 * animation-engine/token-mapper.ts
 *
 * Post-processes a rendered KaTeX container DOM to:
 *  1. Assign `data-token-id` attributes to leaf MathML/HTML spans.
 *  2. Provide a lookup: token raw value → matching DOM elements.
 *
 * This is used by the AnimationPlayer in MorphSolver.svelte to target
 * individual terms in the rendered LaTeX with animejs.
 *
 * Strategy:
 *   KaTeX renders \textcolor{color}{...} as <span style="color:..."> inside
 *   the .katex container. We collect all such colored spans (they represent
 *   "active" nodes from the backend's highlighted_latex).
 *   Additionally we tag every leaf <mtext>/<mn>/<mi>/<mo> span that carries
 *   a data-token-id so the animation engine can target them.
 */

export interface TokenSpan {
  id:      string
  value:   string
  el:      HTMLElement
}

/**
 * Walk the KaTeX container and assign `data-token-id` to every colored span
 * and every leaf content span.
 *
 * Returns a map: tokenId → HTMLElement for use with animejs selectors.
 */
export function mapTokens(container: HTMLElement): Map<string, HTMLElement[]> {
  const result = new Map<string, HTMLElement[]>()
  let counter = 0

  // 1. Colored spans (from \textcolor) — these are the "highlighted" nodes
  const colored = Array.from(
    container.querySelectorAll<HTMLElement>('.katex [style*="color:"]')
  )
  for (const el of colored) {
    const id = `token-colored-${counter++}`
    el.setAttribute('data-token-id', id)
    if (!result.has('colored')) result.set('colored', [])
    result.get('colored')!.push(el)
    result.set(id, [el])
  }

  // 2. Leaf content spans (mn=number, mi=variable, mo=operator)
  // KaTeX uses class names: .mord, .mop, .mrel, .mopen, .mclose, .mpunct
  const leafSelectors = '.katex .mord, .katex .mop, .katex .mrel'
  const leaves = Array.from(
    container.querySelectorAll<HTMLElement>(leafSelectors)
  ).filter(el => {
    // Only take elements with direct text content (no nested .mord children)
    return el.children.length === 0 || !el.querySelector('.mord, .mop')
  })

  for (const el of leaves) {
    const text = el.textContent?.trim() ?? ''
    if (!text) continue
    const id = `token-${text}-${counter++}`
    el.setAttribute('data-token-id', id)
    result.set(id, [el])
    // Also group by value for easy lookup
    if (!result.has(`val:${text}`)) result.set(`val:${text}`, [])
    result.get(`val:${text}`)!.push(el)
  }

  return result
}

/**
 * Returns all elements in a container that have a data-token-id set.
 * Safe to call multiple times (idempotent).
 */
export function getTaggedElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-token-id]'))
}

/**
 * Returns the colored spans (backend-highlighted nodes) in a container.
 * These are the primary animation targets during step transitions.
 */
export function getColoredSpans(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('.katex [style*="color:"]')
  )
}
