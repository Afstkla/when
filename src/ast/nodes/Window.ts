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
        [s, e] = monthWindow(today, n, forward, 1);
        break;
      case 'quarter':
        [s, e] = monthWindow(today, n, forward, 3);
        break;
      case 'half':
        [s, e] = monthWindow(today, n, forward, 6);
        break;
      case 'year':
        [s, e] = yearWindow(today, n, forward, 1);
        break;
      case 'decade':
        [s, e] = yearWindow(today, n, forward, 10);
        break;
      case 'century':
        [s, e] = yearWindow(today, n, forward, 100);
        break;
      case 'millennium':
        [s, e] = yearWindow(today, n, forward, 1000);
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
    }
    return [s, e];
  }
}

function monthWindow(
  today: Date,
  n: number,
  forward: boolean,
  monthsPerUnit: number,
): [Date, Date] {
  if (forward) return [today, addDays(addMonths(today, n * monthsPerUnit), -1)];
  return [addDays(addMonths(today, -n * monthsPerUnit), 1), today];
}

function yearWindow(today: Date, n: number, forward: boolean, yearsPerUnit: number): [Date, Date] {
  if (forward) return [today, addDays(addYears(today, n * yearsPerUnit), -1)];
  return [addDays(addYears(today, -n * yearsPerUnit), 1), today];
}
