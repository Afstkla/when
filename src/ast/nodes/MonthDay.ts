import { makeDate } from '../../dates.js';
import type { EvalContext } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** A specific month-day(-year) date: `may 12`, `12 may`, `may 12 2026`. */
export class MonthDay extends DateNode {
  constructor(
    public readonly month: number,
    public readonly day: number,
    public readonly year: number,
  ) {
    super();
  }
  protected override computeDate(_ctx: EvalContext): Date | null {
    const d = makeDate(this.year, this.month, this.day);
    return d.getMonth() === this.month ? d : null;
  }
}
