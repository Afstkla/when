import { addDays } from '../../dates.js';
import type { EvalContext, WeekdayIndex } from '../../types.js';
import type { AstNode } from '../AstNode.js';
import { DateNode } from '../DateNode.js';

/**
 * The Nth weekday inside an arbitrary container range: `first mon of march`,
 * `last fri of october 2027`, `3rd thu of next month`, `3rd fri of 1st millennium`.
 *
 * Iterates the container's [start, end] looking for the Nth matching weekday.
 * Negative `nth` counts from the end (`-1` = last).
 */
export class NthWeekday extends DateNode {
  constructor(
    public readonly nth: number,
    public readonly wd: WeekdayIndex,
    public readonly container: AstNode,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date | null {
    const ref = this.container.evaluate(ctx);
    if (!ref || this.nth === 0) return null;
    const target = Math.abs(this.nth);
    const step = this.nth > 0 ? 1 : -1;
    const cmp =
      step > 0
        ? (d: Date) => d.getTime() <= ref.end.getTime()
        : (d: Date) => d.getTime() >= ref.start.getTime();

    let count = 0;
    for (let d = step > 0 ? ref.start : ref.end; cmp(d); d = addDays(d, step)) {
      if (d.getDay() === this.wd && ++count === target) return d;
    }
    return null;
  }
}
