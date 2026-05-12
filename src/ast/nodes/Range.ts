import type { EvalContext } from '../../types.js';
import type { AstNode } from '../AstNode.js';
import { RangeNode } from '../RangeNode.js';

/** A range built from two child expressions (`X to Y`, `from X to Y`, `between X and Y`). */
export class Range extends RangeNode {
  constructor(
    public readonly a: AstNode,
    public readonly b: AstNode,
  ) {
    super();
  }
  protected override computeRange(ctx: EvalContext): readonly [Date, Date] | null {
    const ar = this.a.evaluate(ctx);
    const br = this.b.evaluate(ctx);
    if (!ar || !br) return null;
    // The range spans the earliest start to the latest end, regardless of input order.
    const lo = ar.start <= br.start ? ar.start : br.start;
    const hi = ar.end >= br.end ? ar.end : br.end;
    return [lo, hi];
  }
}
