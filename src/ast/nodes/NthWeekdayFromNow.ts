import { addDays } from '../../dates.js';
import type { EvalContext, WeekdayIndex } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** "2 mondays from now" / "3 fridays ago" — the Nth occurrence of a weekday in a direction. */
export class NthWeekdayFromNow extends DateNode {
  constructor(
    public readonly n: number,
    public readonly wd: WeekdayIndex,
    public readonly dir: 1 | -1,
  ) {
    super();
  }
  protected override computeDate(ctx: EvalContext): Date {
    let d = new Date(ctx.today);
    let steps = Math.abs(this.n);
    do {
      d = addDays(d, this.dir);
    } while (d.getDay() !== this.wd);
    steps -= 1;
    d = addDays(d, this.dir * 7 * steps);
    return d;
  }
}
