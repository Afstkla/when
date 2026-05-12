import type { EvalContext } from '../../types.js';
import { DateNode } from '../DateNode.js';

/** A literal calendar date supplied directly by the tokenizer (ISO, slash, dot). */
export class DateLit extends DateNode {
  constructor(public readonly date: Date) {
    super();
  }
  protected override computeDate(_ctx: EvalContext): Date {
    return this.date;
  }
}
