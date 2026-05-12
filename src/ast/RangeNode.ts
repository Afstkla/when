import { type EvalContext, Result, type WhenResult } from '../types.js';
import { AstNode } from './AstNode.js';

/** AST node that always produces a date range. */
export abstract class RangeNode extends AstNode {
  override evaluate(ctx: EvalContext): WhenResult | null {
    const r = this.computeRange(ctx);
    return r === null ? null : Result.range(r[0], r[1]);
  }
  protected abstract computeRange(ctx: EvalContext): readonly [Date, Date] | null;
}
