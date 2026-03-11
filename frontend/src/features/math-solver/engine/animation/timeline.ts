/**
 * animation-engine/timeline.ts
 *
 * Converts an ordered list of AnimationOps into a flat timeline with absolute
 * timestamps (milliseconds from t=0).
 *
 * Default timing model:
 *   highlight_term     → 0  ms offset  (runs immediately)
 *   fade_out           → +300 ms after previous op of any type
 *   move_term          → +300 ms after previous
 *   simplify_number    → +300 ms after previous
 *   rewrite_expression → +150 ms after the last non-rewrite op
 *
 * Ops of the same "phase" can overlap; e.g. multiple highlights fire together.
 */

import type { AnimationOp, AnimationOpType } from './mapper'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  /** Absolute start time in ms from the beginning of the step animation */
  time: number
  op: AnimationOp
}

export interface Timeline {
  /** Ordered entries by ascending time */
  animations: TimelineEntry[]
  /** Total duration of this step's animation in ms */
  totalDuration: number
}

// ─── Timing constants ─────────────────────────────────────────────────────────

const PHASE_OFFSET: Record<AnimationOpType, number> = {
  highlight_term:     0,
  fade_out:           300,
  move_term:          300,
  simplify_number:    300,
  rewrite_expression: 150,
}

/**
 * How long each op type is "active" (used to compute the end of the timeline).
 * The op's own `.duration` field wins if set.
 */
const DEFAULT_DURATION: Record<AnimationOpType, number> = {
  highlight_term:     400,
  fade_out:           300,
  move_term:          600,
  simplify_number:    500,
  rewrite_expression: 400,
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Build a Timeline from an ordered list of AnimationOps.
 *
 * The algorithm:
 * 1. Group ops by "phase":
 *    – Phase 0: all highlight_term ops (fire together at t=0)
 *    – Phase 1: all fade_out + move_term + simplify_number ops
 *    – Phase 2: all rewrite_expression ops
 *
 * 2. Each phase starts after the previous phase's ops have had time to complete
 *    (max end-time of previous phase + PHASE_OFFSET of current op type).
 *
 * 3. Within a phase, ops of the same type fire concurrently (same timestamp).
 *    Multiple different types within a phase are interleaved using PHASE_OFFSET.
 */
export function buildTimeline(ops: AnimationOp[]): Timeline {
  if (ops.length === 0) {
    return { animations: [], totalDuration: 0 }
  }

  const entries: TimelineEntry[] = []
  let cursor = 0  // current time cursor in ms

  // Phase 0: highlights (concurrent)
  const highlights = ops.filter(op => op.type === 'highlight_term')
  if (highlights.length > 0) {
    for (const op of highlights) {
      entries.push({ time: cursor, op })
    }
    cursor += Math.max(...highlights.map(op => op.duration ?? DEFAULT_DURATION.highlight_term))
  }

  // Phase 1: fades, moves, simplify_number (concurrent within sub-type)
  const phase1Types: AnimationOpType[] = ['fade_out', 'move_term', 'simplify_number']
  for (const opType of phase1Types) {
    const group = ops.filter(op => op.type === opType)
    if (group.length === 0) continue
    const start = cursor + PHASE_OFFSET[opType]
    for (const op of group) {
      entries.push({ time: start, op })
    }
    const maxDur = Math.max(...group.map(op => op.duration ?? DEFAULT_DURATION[opType]))
    cursor = Math.max(cursor, start + maxDur)
  }

  // Phase 2: rewrites (concurrent)
  const rewrites = ops.filter(op => op.type === 'rewrite_expression')
  if (rewrites.length > 0) {
    const start = cursor + PHASE_OFFSET.rewrite_expression
    for (const op of rewrites) {
      entries.push({ time: start, op })
    }
    const maxDur = Math.max(...rewrites.map(op => op.duration ?? DEFAULT_DURATION.rewrite_expression))
    cursor = start + maxDur
  }

  // Sort by time
  entries.sort((a, b) => a.time - b.time)

  return {
    animations: entries,
    totalDuration: cursor,
  }
}

// ─── Convenience ──────────────────────────────────────────────────────────────

/**
 * Serialize a Timeline to the JSON wire format expected by the spec:
 *
 *   { animations: [ { time: 0, type: "highlight", node: "+3" }, ... ] }
 */
export function serializeTimeline(timeline: Timeline): object {
  return {
    animations: timeline.animations.map(entry => ({
      time:     entry.time,
      type:     entry.op.type,
      node:     entry.op.node,
      ...(entry.op.from     !== undefined ? { from: entry.op.from }     : {}),
      ...(entry.op.to       !== undefined ? { to:   entry.op.to   }     : {}),
      ...(entry.op.meta     !== undefined ? { meta: entry.op.meta }     : {}),
      duration: entry.op.duration,
    })),
    totalDuration: timeline.totalDuration,
  }
}
