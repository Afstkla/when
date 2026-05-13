import { addDays, easterDate, makeDate, nthWeekdayInMonth } from '../../dates.js';
import type { EvalContext, HolidayDefinition } from '../../types.js';
import { DateNode } from '../DateNode.js';

/**
 * A named holiday — fixed-date, nth-weekday, Easter-relative, or solstice/equinox.
 * If `year` is null the date auto-rolls to the next occurrence (so `christmas`
 * on Dec 26 resolves to next year's Dec 25).
 */
export class Holiday extends DateNode {
  constructor(
    public readonly name: string,
    public readonly def: HolidayDefinition,
    public readonly year: number | null,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date | null {
    const yr = this.year ?? ctx.today.getFullYear();
    const d = Holiday.computeIn(this.def, yr, ctx.today);
    if (!d) return null;
    if (this.year === null && d < ctx.today) {
      return Holiday.computeIn(this.def, yr + 1, ctx.today);
    }
    return d;
  }

  static computeIn(def: HolidayDefinition, year: number, today: Date): Date | null {
    switch (def.type) {
      case 'fixed':
        return makeDate(year, def.month, def.day);
      case 'nth':
        return nthWeekdayInMonth(year, def.month, def.weekday, def.nth);
      case 'easter':
        return addDays(easterDate(year), def.offset);
      case 'solstice': {
        const summer = makeDate(year, 5, 21);
        const winter = makeDate(year, 11, 21);
        if (today < summer) return summer;
        if (today < winter) return winter;
        return makeDate(year + 1, 5, 21);
      }
      case 'equinox': {
        const vernal = makeDate(year, 2, 20);
        const autumnal = makeDate(year, 8, 22);
        if (today < vernal) return vernal;
        if (today < autumnal) return autumnal;
        return makeDate(year + 1, 2, 20);
      }
    }
  }
}
