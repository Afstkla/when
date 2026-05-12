/**
 * Lunar phase computations. Uses the synodic period (~29.53 days) anchored to
 * a known new moon (2000-01-06 18:14 UTC). Accurate to within a few hours,
 * which is fine for a date picker that operates at day-level resolution.
 */

import { MS_PER_DAY } from './dates.js';

const SYNODIC_DAYS = 29.530_588_67;
const KNOWN_NEW_MOON_DAYS = Date.UTC(2000, 0, 6, 18, 14) / MS_PER_DAY;

export type MoonPhaseName =
  | 'new'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

/** Returns a fraction in [0, 1): 0 = new moon, 0.5 = full moon, 1 = next new moon. */
export function moonPhase(d: Date): number {
  const days = d.getTime() / MS_PER_DAY;
  let p = ((days - KNOWN_NEW_MOON_DAYS) % SYNODIC_DAYS) / SYNODIC_DAYS;
  if (p < 0) p += 1;
  return p;
}

export function moonName(phase: number): MoonPhaseName {
  if (phase < 0.03 || phase > 0.97) return 'new';
  if (phase < 0.22) return 'waxing crescent';
  if (phase < 0.28) return 'first quarter';
  if (phase < 0.47) return 'waxing gibbous';
  if (phase < 0.53) return 'full';
  if (phase < 0.72) return 'waning gibbous';
  if (phase < 0.78) return 'last quarter';
  return 'waning crescent';
}

/**
 * Returns the CSS `clip-path` value for the lit side of a moon disc with the
 * given radius (in user units). Used by the demo to render moon glyphs.
 */
export function moonClipPath(phase: number, radius: number): string {
  const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  if (illum < 0.02) return 'inset(0 100% 0 0)';
  if (illum > 0.98) return 'inset(0 0 0 0)';
  const waxing = phase < 0.5;
  const k = Math.abs(2 * illum - 1);
  const fullSide = illum > 0.5;
  const r = radius;
  if (waxing) {
    return fullSide
      ? `path('M ${r},0 A ${r},${r} 0 0 1 ${r},${2 * r} A ${r * k},${r} 0 0 0 ${r},0 Z')`
      : `path('M ${r},0 A ${r},${r} 0 0 1 ${r},${2 * r} A ${r * k},${r} 0 0 1 ${r},0 Z')`;
  }
  return fullSide
    ? `path('M ${r},0 A ${r},${r} 0 0 0 ${r},${2 * r} A ${r * k},${r} 0 0 1 ${r},0 Z')`
    : `path('M ${r},0 A ${r},${r} 0 0 0 ${r},${2 * r} A ${r * k},${r} 0 0 0 ${r},0 Z')`;
}
