import { addDays } from '../../dates.js';
import type { EvalContext, WeekdayIndex } from '../../types.js';
import { DateNode } from '../DateNode.js';

export type WeekdayDir = 'this' | 'next' | 'last' | 'next-or-today';

/** A weekday with optional direction — `monday`, `next fri`, `last tue`. */
export class Weekday extends DateNode {
  constructor(
    public readonly dir: WeekdayDir,
    public readonly wd: WeekdayIndex,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date {
    const todayDow = ctx.today.getDay();
    let diff = this.wd - todayDow;
    switch (this.dir) {
      case 'this':
        if (diff < 0) diff += 7;
        break;
      case 'next':
        if (diff <= 0) diff += 7;
        break;
      case 'last':
        if (diff >= 0) diff -= 7;
        break;
      case 'next-or-today':
        if (diff < 0) diff += 7;
        break;
    }
    return addDays(ctx.today, diff);
  }
}
