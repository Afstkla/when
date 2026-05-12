import { addDays, diffDays } from '../../dates.js';
import type { Bound, EvalContext } from '../../types.js';
import type { AstNode } from '../AstNode.js';
import { DateNode } from '../DateNode.js';

/** `start of next month`, `end of week`, `mid of 2027` — boundary of a referenced range. */
export class BoundOf extends DateNode {
  constructor(
    public readonly bound: Bound,
    public readonly ref: AstNode,
  ) {
    super();
  }

  protected override computeDate(ctx: EvalContext): Date | null {
    const r = this.ref.evaluate(ctx);
    if (!r) return null;
    switch (this.bound) {
      case 'start':
        return r.start;
      case 'end':
        return r.end;
      case 'mid':
        return new Date(Math.floor((r.start.getTime() + r.end.getTime()) / 2));
      case 'early':
        return addDays(r.start, Math.floor(diffDays(r.start, r.end) * 0.1));
      case 'late':
        return addDays(r.end, -Math.floor(diffDays(r.start, r.end) * 0.1));
    }
  }
}
