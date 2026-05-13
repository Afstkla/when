import { makeDate } from '../dates.js';
import type { EvalContext } from '../types.js';
import { RangeNode } from './RangeNode.js';

/**
 * A range expressed as a contiguous block of months within a year.
 * Subclasses provide the starting month and the span (1 for a single month,
 * 3 for a quarter, 6 for a half).
 */
export abstract class MonthBlockRange extends RangeNode {
  protected abstract get firstMonth(): number;
  protected abstract get monthSpan(): number;
  protected abstract get year(): number;

  protected override computeRange(_ctx: EvalContext): readonly [Date, Date] {
    const start = makeDate(this.year, this.firstMonth, 1);
    // Day 0 of (firstMonth + span) is the last day of (firstMonth + span - 1).
    const end = makeDate(this.year, this.firstMonth + this.monthSpan, 0);
    return [start, end];
  }
}
