import { addBusinessDays, addDays, addMonths, addYears } from '../../dates.js';
import type { EvalContext, TimeUnit } from '../../types.js';
import type { AstNode } from '../AstNode.js';
import { DateNode } from '../DateNode.js';

/** Shift any anchor expression by N units (positive forward, negative back). */
export class Shift extends DateNode {
  constructor(
    public readonly anchor: AstNode,
    public readonly sign: 1 | -1,
    public readonly n: number,
    public readonly unit: TimeUnit,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date | null {
    const inner = this.anchor.evaluate(ctx);
    if (!inner) return null;
    return Shift.applyShift(inner.start, this.sign * this.n, this.unit);
  }

  static applyShift(d: Date, n: number, unit: TimeUnit): Date {
    switch (unit) {
      case 'day':
        return addDays(d, n);
      case 'week':
        return addDays(d, n * 7);
      case 'month':
        return addMonths(d, n);
      case 'quarter':
        return addMonths(d, n * 3);
      case 'half':
        return addMonths(d, n * 6);
      case 'year':
        return addYears(d, n);
      case 'decade':
        return addYears(d, n * 10);
      case 'century':
        return addYears(d, n * 100);
      case 'millennium':
        return addYears(d, n * 1000);
      case 'businessDay':
        return addBusinessDays(d, n);
    }
  }
}
