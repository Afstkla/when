import { makeDate } from '../../dates.js';
import type { Bound, EvalContext } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** `mid-may`, `early june`, `late july`, `start of march`, `end of december 2027`. */
export class BoundOfMonth extends DateNode {
  constructor(
    public readonly bound: Bound,
    public readonly month: number,
    public readonly year: number,
  ) {
    super();
  }

  protected override computeDate(_ctx: EvalContext): Date | null {
    if (this.bound === 'end') return makeDate(this.year, this.month + 1, 0);
    if (this.bound === 'start') return makeDate(this.year, this.month, 1);
    const day = this.bound === 'mid' ? 15 : this.bound === 'early' ? 5 : 25;
    return makeDate(this.year, this.month, day);
  }
}
