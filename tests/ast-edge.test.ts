/**
 * Direct AST node tests for paths that can't be triggered through `parse()`
 * (the parser validates inputs before constructing these nodes). Also covers
 * gibberish inputs that exercise the parser's null-fallthrough paths.
 */

import { describe, expect, it } from 'vitest';
import {
  BoundOf,
  Holiday,
  MonthDay,
  MonthRange,
  NthIn,
  NthWeekday,
  parse,
  Range,
  Result,
  Shift,
  YearRange,
} from '../src/index.js';

const TODAY = new Date(2026, 4, 12);
const CTX = { today: TODAY };

describe('AST nodes — null pass-through', () => {
  it('MonthDay returns null when the constructor month rolls over (e.g. Feb 30)', () => {
    const md = new MonthDay(1, 30, 2026);
    expect(md.evaluate(CTX)).toBeNull();
  });

  it('Range returns null when an inner expression evaluates to null', () => {
    const invalid = new MonthDay(1, 30, 2026); // Feb 30 → null
    const r = new Range(invalid, new MonthDay(4, 12, 2026));
    expect(r.evaluate(CTX)).toBeNull();
  });

  it('BoundOf returns null when its ref evaluates to null', () => {
    const invalid = new MonthDay(1, 30, 2026);
    const b = new BoundOf('start', invalid);
    expect(b.evaluate(CTX)).toBeNull();
  });

  it('Shift returns null when its anchor evaluates to null', () => {
    const invalid = new MonthDay(1, 30, 2026);
    const s = new Shift(invalid, 1, 5, 'day');
    expect(s.evaluate(CTX)).toBeNull();
  });
});

describe('NthIn direct edge cases', () => {
  it('returns null for n = 0', () => {
    expect(new NthIn('day', 0, new YearRange(2026)).evaluate(CTX)).toBeNull();
  });

  it('slices half from a container that starts in H2', () => {
    // August 2026 — start.getMonth() = 7 → the `sh = 1` branch.
    const aug = new MonthRange(7, 2026);
    const r = new NthIn('half', 1, aug).evaluate(CTX);
    expect(r?.kind).toBe('range');
  });
});

describe('NthIn overflow / underflow', () => {
  const yr = new YearRange(2026);
  const overflow = (
    unit:
      | 'day'
      | 'week'
      | 'month'
      | 'quarter'
      | 'half'
      | 'year'
      | 'decade'
      | 'century'
      | 'millennium',
    n: number,
  ) => new NthIn(unit, n, yr).evaluate(CTX);

  it('returns null when N exceeds the slice count', () => {
    expect(overflow('day', 400)).toBeNull();
    expect(overflow('week', 60)).toBeNull();
    expect(overflow('month', 13)).toBeNull();
    expect(overflow('quarter', 5)).toBeNull();
    expect(overflow('half', 3)).toBeNull();
    expect(overflow('year', 2)).toBeNull();
    expect(overflow('decade', 2)).toBeNull();
    expect(overflow('century', 2)).toBeNull();
    expect(overflow('millennium', 2)).toBeNull();
  });

  it('returns null when N is too negative (counted from the end)', () => {
    expect(overflow('day', -400)).toBeNull();
    expect(overflow('week', -60)).toBeNull();
    expect(overflow('month', -13)).toBeNull();
    expect(overflow('quarter', -5)).toBeNull();
    expect(overflow('half', -3)).toBeNull();
    expect(overflow('year', -2)).toBeNull();
    expect(overflow('decade', -2)).toBeNull();
    expect(overflow('century', -2)).toBeNull();
    expect(overflow('millennium', -2)).toBeNull();
  });

  it('accepts the last item via N = -1', () => {
    const last = new NthIn('day', -1, yr).evaluate(CTX);
    expect(last).not.toBeNull();
    expect(last?.kind).toBe('single');
  });
});

describe('NthWeekday edge cases', () => {
  it('returns null when ref is null', () => {
    const invalid = new MonthDay(1, 30, 2026);
    expect(new NthWeekday(1, 5, invalid).evaluate(CTX)).toBeNull();
  });
});

describe('Holiday with explicit year (year != null short-circuit)', () => {
  it('returns the exact year regardless of "today"', () => {
    const def = { type: 'fixed' as const, month: 11 as const, day: 25 };
    const h = new Holiday('christmas', def, 1990);
    const r = h.evaluate(CTX);
    expect(r?.start.getFullYear()).toBe(1990);
  });
});

describe('parser fallthrough — gibberish that produces no tokens', () => {
  it('"the" alone normalizes to empty token stream', () => {
    expect(parse('the', { today: TODAY })).toBeNull();
  });
  it('"+5x" where x is not a unit returns null (signed-offset path)', () => {
    expect(parse('+5x', { today: TODAY })).toBeNull();
  });
});

describe('Result.range constructor — already covered, sanity check', () => {
  it('normalises swapped inputs', () => {
    const r = Result.range(new Date(2026, 4, 20), new Date(2026, 4, 10));
    expect(r.start.getTime()).toBeLessThan(r.end.getTime());
  });
});
