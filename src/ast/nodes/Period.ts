import {
  addBusinessDays,
  addDays,
  addMonths,
  endOfMonth,
  startOfMonth,
  startOfWeekMon,
} from '../../dates.js';
import { type EvalContext, Result, type TimeUnit, type WhenResult } from '../../types.js';
import { AstNode } from '../AstNode.js';

/**
 * "this/next/last + UNIT" — e.g. `this week`, `last quarter`, `next decade`.
 * The result is a single date for day-scale units and a range for the rest;
 * that mixed shape is why this node sits on the base `AstNode` directly.
 */
export class Period extends AstNode {
  constructor(
    public readonly dir: 'this' | 'next' | 'last',
    public readonly unit: TimeUnit,
  ) {
    super();
  }

  override evaluate(ctx: EvalContext): WhenResult | null {
    const sign = this.dir === 'next' ? 1 : this.dir === 'last' ? -1 : 0;
    const today = ctx.today;
    const yr = today.getFullYear();

    switch (this.unit) {
      case 'day':
        return Result.single(addDays(today, sign));
      case 'week': {
        const s = addDays(startOfWeekMon(today), sign * 7);
        return Result.range(s, addDays(s, 6));
      }
      case 'month': {
        const ref = addMonths(today, sign);
        return Result.range(startOfMonth(ref), endOfMonth(ref));
      }
      case 'year': {
        const y = yr + sign;
        return Result.range(new Date(y, 0, 1), new Date(y, 11, 31));
      }
      case 'quarter': {
        const qi = Math.floor(today.getMonth() / 3) + sign;
        const y = yr + Math.floor(qi / 4);
        const q = ((qi % 4) + 4) % 4;
        return Result.range(new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 0));
      }
      case 'half': {
        const hCurrent = today.getMonth() < 6 ? 0 : 1;
        const hi = hCurrent + sign;
        const y = yr + Math.floor(hi / 2);
        const h = ((hi % 2) + 2) % 2;
        return Result.range(new Date(y, h * 6, 1), new Date(y, h * 6 + 6, 0));
      }
      case 'decade': {
        const cur = Math.floor(yr / 10) * 10;
        const target = cur + sign * 10;
        return Result.range(new Date(target, 0, 1), new Date(target + 9, 11, 31));
      }
      case 'century': {
        const cur = Math.floor(yr / 100) * 100;
        const target = cur + sign * 100;
        return Result.range(new Date(target, 0, 1), new Date(target + 99, 11, 31));
      }
      case 'millennium': {
        const cur = Math.floor(yr / 1000) * 1000;
        const target = cur + sign * 1000;
        return Result.range(new Date(target, 0, 1), new Date(target + 999, 11, 31));
      }
      case 'businessDay': {
        if (sign === 0) {
          const dow = today.getDay();
          if (dow === 0 || dow === 6) return Result.single(addBusinessDays(today, 1));
          return Result.single(today);
        }
        return Result.single(addBusinessDays(today, sign));
      }
    }
  }
}
