// ═══════════════════════════════════════════════════════════════
// EVERLOOP WORLD METRICS — Time & Distance Constants
// ═══════════════════════════════════════════════════════════════
// Canonical, deterministic constants for every backend system that
// reasons about Everloop time, geography, or travel. Do NOT redefine
// these values elsewhere — import from this module.
//
// Time mapping (integer seconds, Earth-second based):
//   1 Minute = 60s
//   1 Hour   = 60 Minutes        = 3,600s
//   1 Day    = 24 Hours          = 86,400s
//   1 Cycle  = 30 Days           = 2,592,000s   (≈ Month / Season)
//   1 Loop   = 10 Cycles / 300 Days = 25,920,000s (≈ Year)
//
// Geography:
//   8 interconnected Regions, total bounding box ~4,000 miles wide,
//   average Region width ~600 miles.
// ═══════════════════════════════════════════════════════════════

// ── Time ────────────────────────────────────────────────────────
export const MINUTE_IN_SECONDS = 60
export const HOUR_IN_SECONDS = 3_600
export const DAY_IN_SECONDS = 86_400
export const CYCLE_IN_SECONDS = 2_592_000
export const LOOP_IN_SECONDS = 25_920_000

export const HOURS_PER_DAY = 24
export const DAYS_PER_CYCLE = 30
export const CYCLES_PER_LOOP = 10
export const DAYS_PER_LOOP = DAYS_PER_CYCLE * CYCLES_PER_LOOP // 300

// ── Geography ───────────────────────────────────────────────────
export const TOTAL_REGIONS = 8
export const MAP_WIDTH_MILES = 4_000
export const REGION_WIDTH_MILES = 600

// ── Travel speeds (miles per Day) ───────────────────────────────
export const SPEED_FOOT = 20
export const SPEED_MOUNT = 40
export const SPEED_CARAVAN = 15

export type TravelMode = 'foot' | 'mount' | 'caravan'

const SPEED_BY_MODE: Record<TravelMode, number> = {
  foot: SPEED_FOOT,
  mount: SPEED_MOUNT,
  caravan: SPEED_CARAVAN,
}

export function speedForMode(mode: TravelMode): number {
  return SPEED_BY_MODE[mode]
}

// ═══════════════════════════════════════════════════════════════
// Decomposition helpers
// ═══════════════════════════════════════════════════════════════

export interface ShortDuration {
  /** Total seconds (input, normalised to a non-negative integer) */
  totalSeconds: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface LongDuration {
  totalSeconds: number
  loops: number
  cycles: number
  days: number
  hours: number
}

/**
 * Break a duration into Days / Hours / Minutes / Seconds.
 * Use for short-term things: quest travel, encounter timers, recent events.
 */
export function decomposeShort(seconds: number): ShortDuration {
  const total = Math.max(0, Math.floor(seconds))
  const days = Math.floor(total / DAY_IN_SECONDS)
  let rem = total - days * DAY_IN_SECONDS
  const hours = Math.floor(rem / HOUR_IN_SECONDS)
  rem -= hours * HOUR_IN_SECONDS
  const minutes = Math.floor(rem / MINUTE_IN_SECONDS)
  const secs = rem - minutes * MINUTE_IN_SECONDS
  return { totalSeconds: total, days, hours, minutes, seconds: secs }
}

/**
 * Break a duration into Loops / Cycles / Days / Hours.
 * Use for historical events, long-term campaigns, era references.
 */
export function decomposeLong(seconds: number): LongDuration {
  const total = Math.max(0, Math.floor(seconds))
  const loops = Math.floor(total / LOOP_IN_SECONDS)
  let rem = total - loops * LOOP_IN_SECONDS
  const cycles = Math.floor(rem / CYCLE_IN_SECONDS)
  rem -= cycles * CYCLE_IN_SECONDS
  const days = Math.floor(rem / DAY_IN_SECONDS)
  rem -= days * DAY_IN_SECONDS
  const hours = Math.floor(rem / HOUR_IN_SECONDS)
  return { totalSeconds: total, loops, cycles, days, hours }
}

// ═══════════════════════════════════════════════════════════════
// Travel calculation
// ═══════════════════════════════════════════════════════════════

export interface TravelEstimate {
  distanceMiles: number
  mode: TravelMode
  speedMilesPerDay: number
  /** Fractional travel days (distance / speed) */
  durationDays: number
  /** Total travel time in whole seconds */
  durationSeconds: number
  /** Whole Days component */
  days: number
  /** Whole Hours component (0–23) */
  hours: number
  /** Human-friendly short-form string, e.g. "4 Days and 10 Hours" */
  label: string
}

/**
 * Calculate travel duration for a quest leg.
 *
 * Formula: time = distance / speed.  Speed is in miles/Day, so we
 * convert the fractional day result into whole seconds, then split
 * into Days + Hours for the front end.
 */
export function calculateTravel(
  distanceMiles: number,
  mode: TravelMode = 'foot'
): TravelEstimate {
  const distance = Math.max(0, distanceMiles)
  const speed = speedForMode(mode)
  const durationDays = distance / speed
  const durationSeconds = Math.round(durationDays * DAY_IN_SECONDS)

  const days = Math.floor(durationSeconds / DAY_IN_SECONDS)
  const hours = Math.floor(
    (durationSeconds - days * DAY_IN_SECONDS) / HOUR_IN_SECONDS
  )

  return {
    distanceMiles: distance,
    mode,
    speedMilesPerDay: speed,
    durationDays,
    durationSeconds,
    days,
    hours,
    label: formatShort(durationSeconds),
  }
}

// ═══════════════════════════════════════════════════════════════
// Formatting
// ═══════════════════════════════════════════════════════════════

function pluralize(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

/**
 * Join significant parts with commas + final "and".
 * `joinParts(["4 Days", "10 Hours"])` → "4 Days and 10 Hours"
 */
function joinParts(parts: string[]): string {
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

/**
 * Format a duration for short-term contexts (quest legs, timers).
 * Returns Days + Hours when the trip is ≥ 1 day; otherwise drops to
 * Hours / Minutes / Seconds as needed.
 *
 *   formatShort(367_200) → "4 Days and 6 Hours"
 *   formatShort(5_400)   → "1 Hour and 30 Minutes"
 *   formatShort(0)       → "0 Minutes"
 */
export function formatShort(seconds: number): string {
  const d = decomposeShort(seconds)
  const parts: string[] = []

  if (d.days > 0) {
    parts.push(pluralize(d.days, 'Day'))
    if (d.hours > 0) parts.push(pluralize(d.hours, 'Hour'))
    return joinParts(parts)
  }
  if (d.hours > 0) {
    parts.push(pluralize(d.hours, 'Hour'))
    if (d.minutes > 0) parts.push(pluralize(d.minutes, 'Minute'))
    return joinParts(parts)
  }
  if (d.minutes > 0) {
    parts.push(pluralize(d.minutes, 'Minute'))
    if (d.seconds > 0) parts.push(pluralize(d.seconds, 'Second'))
    return joinParts(parts)
  }
  return pluralize(d.seconds, 'Second')
}

/**
 * Format a duration for long-term / historical contexts.
 * Returns the two largest non-zero units, falling back through
 * Loops → Cycles → Days → Hours.
 *
 *   formatLong(...) → "2 Loops and 4 Cycles"
 *   formatLong(...) → "3 Cycles and 12 Days"
 *
 * Pass `suffix = "ago"` to render historical phrases:
 *   formatLong(seconds, "ago") → "2 Loops and 4 Cycles ago"
 */
export function formatLong(seconds: number, suffix?: string): string {
  const d = decomposeLong(seconds)
  const ordered: Array<[number, string]> = [
    [d.loops, 'Loop'],
    [d.cycles, 'Cycle'],
    [d.days, 'Day'],
    [d.hours, 'Hour'],
  ]
  const nonZero = ordered.filter(([n]) => n > 0)
  const top = nonZero.slice(0, 2)
  const phrase =
    top.length === 0
      ? 'less than an Hour'
      : joinParts(top.map(([n, u]) => pluralize(n, u)))
  return suffix ? `${phrase} ${suffix}` : phrase
}

/**
 * Convenience: format the time elapsed since an in-world timestamp
 * (also expressed in Everloop seconds-since-epoch).
 */
export function formatHistorical(
  pastSeconds: number,
  nowSeconds: number
): string {
  return formatLong(Math.max(0, nowSeconds - pastSeconds), 'ago')
}
