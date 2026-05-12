import { type EvalContext, Result, type WhenResult } from '../types.js';
import { AstNode } from './AstNode.js';

/**
 * AST node that always produces a single date. Subclasses implement
 * {@link computeDate} and inherit the boilerplate of wrapping it as a
 * {@link Result.single}.
 */
export abstract class DateNode extends AstNode {
  override evaluate(ctx: EvalContext): WhenResult | null {
    const d = this.computeDate(ctx);
    return d === null ? null : Result.single(d);
  }
  protected abstract computeDate(ctx: EvalContext): Date | null;
}
