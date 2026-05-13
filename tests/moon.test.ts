import { describe, expect, it } from 'vitest';
import { moonClipPath, moonName, moonPhase } from '../src/moon.js';

describe('moonPhase', () => {
  it('returns a fraction in [0, 1)', () => {
    const p = moonPhase(new Date(2026, 4, 12));
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
  });

  it('is ~0 at known new moon (2000-01-06)', () => {
    const p = moonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14)));
    expect(p).toBeLessThan(0.01);
  });

  it('cycles every ~29.53 days', () => {
    const d = new Date(2026, 4, 12);
    const p1 = moonPhase(d);
    const p2 = moonPhase(new Date(d.getTime() + 29.530_588_67 * 86_400_000));
    expect(Math.abs(p1 - p2)).toBeLessThan(0.01);
  });

  it('handles dates before the anchor (negative modulo branch)', () => {
    // Pre-Jan-6-2000 — triggers the `if (p < 0) p += 1` branch
    const p = moonPhase(new Date(1995, 0, 1));
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
  });
});

describe('moonName', () => {
  it('classifies the 8 conventional phases', () => {
    expect(moonName(0)).toBe('new');
    expect(moonName(0.15)).toBe('waxing crescent');
    expect(moonName(0.25)).toBe('first quarter');
    expect(moonName(0.35)).toBe('waxing gibbous');
    expect(moonName(0.5)).toBe('full');
    expect(moonName(0.65)).toBe('waning gibbous');
    expect(moonName(0.75)).toBe('last quarter');
    expect(moonName(0.85)).toBe('waning crescent');
  });
});

describe('moonClipPath', () => {
  it('returns inset for new and full moons', () => {
    expect(moonClipPath(0, 6)).toBe('inset(0 100% 0 0)');
    expect(moonClipPath(0.5, 6)).toBe('inset(0 0 0 0)');
  });
  it('returns a path() for in-between phases', () => {
    // Quarters (illum exactly 0.5) — fullSide=false branch
    expect(moonClipPath(0.25, 6)).toMatch(/^path\(/);
    expect(moonClipPath(0.75, 6)).toMatch(/^path\(/);
    // Gibbous (illum > 0.5) — fullSide=true branch for waxing and waning
    expect(moonClipPath(0.35, 6)).toMatch(/^path\(/);
    expect(moonClipPath(0.65, 6)).toMatch(/^path\(/);
    // Waning crescent (illum well below 0.5) — fullSide=false branch for waning
    expect(moonClipPath(0.85, 6)).toMatch(/^path\(/);
  });
});
