/**
 * animation-engine/index.ts
 *
 * Public surface of the animation engine.
 *
 * Usage:
 *   import { buildStepAnimation, serializeTimeline } from '../animation-engine'
 */

export type { AnimationOp, AnimationOpType } from './mapper'
export { mapTransformationToAnimation } from './mapper'

export type { TimelineEntry, Timeline } from './timeline'
export { buildTimeline, serializeTimeline } from './timeline'

export { mapTokens, getTaggedElements, getColoredSpans } from './token-mapper'
export type { TokenSpan } from './token-mapper'

// ─── Convenience: full pipeline in one call ────────────────────────────────────

import { mapTransformationToAnimation } from './mapper'
import { buildTimeline } from './timeline'
import type { TransformationType } from '../explanation/templates'
import type { DiffOp } from '../explanation/ast-diff'
import type { Timeline } from './timeline'

/**
 * One-shot: given the semantic type and structural diff of a step,
 * returns a ready-to-play Timeline.
 */
export function buildStepAnimation(
  type: TransformationType,
  ops: DiffOp[]
): Timeline {
  const animOps = mapTransformationToAnimation(type, ops)
  return buildTimeline(animOps)
}
