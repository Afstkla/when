import { makeDate } from '../../dates.js';
import type { EvalContext, ZodiacDefinition } from '../../types.js';
import { RangeNode } from '../RangeNode.js';

/** A zodiac sign's date window — `scorpio`, `taurus 2027`, etc. */
export class ZodiacRange extends RangeNode {
  constructor(
    public readonly sign: string,
    public readonly def: ZodiacDefinition,
    public readonly year: number | null,
  ) {
    super();
  }

  protected override computeRange(ctx: EvalContext): readonly [Date, Date] {
    const refYr = this.year ?? ctx.today.getFullYear();
    const z = this.def;
    const start = makeDate(refYr, z.startM, z.startD);
    const end = z.wraps ? makeDate(refYr + 1, z.endM, z.endD) : makeDate(refYr, z.endM, z.endD);
    // Roll forward only applies to non-wrapping signs. For wrapping ones
    // (Capricorn) `end` is always next year's Jan 19, which can't be < today.
    if (this.year === null && !z.wraps && end < ctx.today) {
      return [makeDate(refYr + 1, z.startM, z.startD), makeDate(refYr + 1, z.endM, z.endD)];
    }
    return [start, end];
  }
}
