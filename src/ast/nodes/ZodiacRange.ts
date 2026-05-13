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
    if (this.year === null && end < ctx.today) {
      const ny = refYr + 1;
      return [
        makeDate(ny, z.startM, z.startD),
        z.wraps ? makeDate(ny + 1, z.endM, z.endD) : makeDate(ny, z.endM, z.endD),
      ];
    }
    return [start, end];
  }
}
