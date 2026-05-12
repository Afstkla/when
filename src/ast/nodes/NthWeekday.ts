import { nthWeekdayInMonth } from '../../dates.js';
import type { EvalContext, WeekdayIndex } from '../../types.js';
import type { AstNode } from '../AstNode.js';
import { DateNode } from '../DateNode.js';

/**
 * The Nth weekday of a month-like reference: `first mon of march`,
 * `last fri of october 2027`, `3rd thu of next month`. The month is derived
 * from the evaluated reference's start date.
 */
export class NthWeekday extends DateNode {
  constructor(
    public readonly nth: number,
    public readonly wd: WeekdayIndex,
    public readonly monthRef: AstNode,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date | null {
    const ref = this.monthRef.evaluate(ctx);
    if (!ref) return null;
    const refStart = ref.start;
    return nthWeekdayInMonth(refStart.getFullYear(), refStart.getMonth(), this.wd, this.nth);
  }
}
