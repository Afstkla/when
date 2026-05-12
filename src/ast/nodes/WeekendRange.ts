import { addDays, diffDays } from '../../dates.js';
import type { EvalContext } from '../../types.js';
import { RangeNode } from '../RangeNode.js';

export type WeekendDir = 'this' | 'next' | 'last' | 'after-next';

/** Saturday–Sunday range — relative to today. */
export class WeekendRange extends RangeNode {
  constructor(public readonly dir: WeekendDir) {
    super();
  }

  protected override computeRange(ctx: EvalContext): readonly [Date, Date] {
    const today = ctx.today;
    let sat = today;
    const back = this.dir === 'last';
    while (sat.getDay() !== 6) sat = addDays(sat, back ? -1 : 1);

    if (this.dir === 'next' && diffDays(today, sat) < 7) sat = addDays(sat, 7);
    if (this.dir === 'after-next') sat = addDays(sat, 7);
    if (this.dir === 'last') {
      while (diffDays(sat, today) < 2) sat = addDays(sat, -7);
    }
    return [sat, addDays(sat, 1)];
  }
}
