import { addDays, diffDays, endOfMonth, makeDate, startOfWeekMon } from '../../dates.js';
import { type EvalContext, Result, type TimeUnit, type WhenResult } from '../../types.js';
import { AstNode } from '../AstNode.js';

/**
 * The Nth `unit` within an arbitrary container. The container is any AST
 * node that evaluates to a range; this lets `1st week of sept`,
 * `3rd month of 2027`, `5th month of 2020s`, and `2nd decade of 21st century`
 * all share one rule.
 *
 * The result kind depends on `unit`: `day` yields a single date; everything
 * else yields a range.
 */
export class NthIn extends AstNode {
  constructor(
    public readonly unit: TimeUnit,
    public readonly n: number,
    public readonly container: AstNode,
  ) {
    super();
  }

  override evaluate(ctx: EvalContext): WhenResult | null {
    const c = this.container.evaluate(ctx);
    if (!c) return null;
    return NthIn.sliceWithin(c.start, c.end, this.unit, this.n);
  }

  /**
   * Find the Nth slice of `unit` between two dates (inclusive). Negative `n`
   * counts from the end (`-1` = last).
   */
  static sliceWithin(start: Date, end: Date, unit: TimeUnit, n: number): WhenResult | null {
    if (!n) return null;
    switch (unit) {
      case 'day': {
        const total = diffDays(start, end) + 1;
        const d = n > 0 ? n : total + n + 1;
        if (d < 1 || d > total) return null;
        return Result.single(addDays(start, d - 1));
      }
      case 'week': {
        const w1 = startOfWeekMon(start);
        const wEnd = startOfWeekMon(end);
        const total = diffDays(w1, wEnd) / 7 + 1;
        const w = n > 0 ? n : total + n + 1;
        if (w < 1 || w > total) return null;
        const s = addDays(w1, (w - 1) * 7);
        return Result.range(s, addDays(s, 6));
      }
      case 'month': {
        const total =
          (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        const m = n > 0 ? n : total + n + 1;
        if (m < 1 || m > total) return null;
        const target = start.getMonth() + (m - 1);
        const yr = start.getFullYear() + Math.floor(target / 12);
        const mo = ((target % 12) + 12) % 12;
        const s = makeDate(yr, mo, 1);
        return Result.range(s, endOfMonth(s));
      }
      case 'quarter': {
        const sq = Math.floor(start.getMonth() / 3);
        const eq = Math.floor(end.getMonth() / 3);
        const total = (end.getFullYear() - start.getFullYear()) * 4 + (eq - sq) + 1;
        const q = n > 0 ? n : total + n + 1;
        if (q < 1 || q > total) return null;
        const target = sq + (q - 1);
        const yr = start.getFullYear() + Math.floor(target / 4);
        const qi = ((target % 4) + 4) % 4;
        return Result.range(makeDate(yr, qi * 3, 1), makeDate(yr, qi * 3 + 3, 0));
      }
      case 'half': {
        const sh = start.getMonth() < 6 ? 0 : 1;
        const eh = end.getMonth() < 6 ? 0 : 1;
        const total = (end.getFullYear() - start.getFullYear()) * 2 + (eh - sh) + 1;
        const h = n > 0 ? n : total + n + 1;
        if (h < 1 || h > total) return null;
        const target = sh + (h - 1);
        const yr = start.getFullYear() + Math.floor(target / 2);
        const hi = ((target % 2) + 2) % 2;
        return Result.range(makeDate(yr, hi * 6, 1), makeDate(yr, hi * 6 + 6, 0));
      }
      case 'year': {
        const total = end.getFullYear() - start.getFullYear() + 1;
        const y = n > 0 ? n : total + n + 1;
        if (y < 1 || y > total) return null;
        const yr = start.getFullYear() + y - 1;
        return Result.range(makeDate(yr, 0, 1), makeDate(yr, 11, 31));
      }
      case 'decade': {
        const sDec = Math.floor(start.getFullYear() / 10) * 10;
        const eDec = Math.floor(end.getFullYear() / 10) * 10;
        const total = (eDec - sDec) / 10 + 1;
        const d = n > 0 ? n : total + n + 1;
        if (d < 1 || d > total) return null;
        const dec = sDec + (d - 1) * 10;
        return Result.range(makeDate(dec, 0, 1), makeDate(dec + 9, 11, 31));
      }
      case 'century': {
        const sC = Math.floor(start.getFullYear() / 100) * 100;
        const eC = Math.floor(end.getFullYear() / 100) * 100;
        const total = (eC - sC) / 100 + 1;
        const c = n > 0 ? n : total + n + 1;
        if (c < 1 || c > total) return null;
        const cent = sC + (c - 1) * 100;
        return Result.range(makeDate(cent, 0, 1), makeDate(cent + 99, 11, 31));
      }
      default:
        return null;
    }
  }
}
