import { addBusinessDays, addDays, addMonths, addYears } from '../../dates.js';
import type { EvalContext, TimeUnit } from '../../types.js';
import { RangeNode } from '../RangeNode.js';

/** `next N units` / `last N units` — a window of N units starting from / ending at today. */
export class Window extends RangeNode {
  constructor(
    public readonly dir: 'next' | 'last',
    public readonly n: number,
    public readonly unit: TimeUnit,
  ) {
    super();
  }

  protected override computeRange(ctx: EvalContext): readonly [Date, Date] | null {
    const forward = this.dir === 'next';
    const today = ctx.today;
    const n = this.n;
    let s: Date;
    let e: Date;
    switch (this.unit) {
      case 'day':
        if (forward) {
          s = today;
          e = addDays(today, n - 1);
        } else {
          e = today;
          s = addDays(today, -(n - 1));
        }
        break;
      case 'week':
        if (forward) {
          s = today;
          e = addDays(today, n * 7 - 1);
        } else {
          e = today;
          s = addDays(today, -(n * 7 - 1));
        }
        break;
      case 'month':
        if (forward) {
          s = today;
          e = addDays(addMonths(today, n), -1);
        } else {
          e = today;
          s = addDays(addMonths(today, -n), 1);
        }
        break;
      case 'year':
        if (forward) {
          s = today;
          e = addDays(addYears(today, n), -1);
        } else {
          e = today;
          s = addDays(addYears(today, -n), 1);
        }
        break;
      case 'businessDay':
        if (forward) {
          s = today;
          e = addBusinessDays(today, n - 1);
        } else {
          e = today;
          s = addBusinessDays(today, -(n - 1));
        }
        break;
      default:
        return null;
    }
    return [s, e];
  }
}
