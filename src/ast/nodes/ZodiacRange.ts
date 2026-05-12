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
    const start = new Date(refYr, z.startM, z.startD);
    const end = z.wraps ? new Date(refYr + 1, z.endM, z.endD) : new Date(refYr, z.endM, z.endD);
    if (this.year === null && end < ctx.today) {
      const ny = refYr + 1;
      return [
        new Date(ny, z.startM, z.startD),
        z.wraps ? new Date(ny + 1, z.endM, z.endD) : new Date(ny, z.endM, z.endD),
      ];
    }
    return [start, end];
  }
}
