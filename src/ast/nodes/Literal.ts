import { addDays } from '../../dates.js';
import type { EvalContext } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** A relative literal — `today` (offset 0), `tomorrow` (+1), `yesterday` (-1), `the day after tomorrow` (+2), … */
export class Literal extends DateNode {
  constructor(public readonly offsetDays: number) {
    super();
  }
  protected override computeDate(ctx: EvalContext): Date {
    return addDays(ctx.today, this.offsetDays);
  }
}
