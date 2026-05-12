import { addDays } from '../../dates.js';
import type { EvalContext } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** Bare `weekday` — the next non-weekend day strictly after today. */
export class NextWeekday extends DateNode {
  protected override computeDate(ctx: EvalContext): Date {
    let d = addDays(ctx.today, 1);
    while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1);
    return d;
  }
}
