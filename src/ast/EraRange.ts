import type { EvalContext } from '../types.js';
import { RangeNode } from './RangeNode.js';

/**
 * An era range — N consecutive years, where N is fixed per subclass and the
 * starting year is derived from a sign-specific anchor (`year`, `decade`,
 * `centuryNumber`, `millenniumNumber`). Centralises the year-to-range math.
 */
export abstract class EraRange extends RangeNode {
  /** Number of consecutive years this era spans (1 for Year, 10 for Decade, 100 for Century, 1000 for Millennium). */
  protected abstract get years(): number;
  /** First year of the era (inclusive). */
  protected abstract get firstYear(): number;

  protected override computeRange(_ctx: EvalContext): readonly [Date, Date] {
    const y = this.firstYear;
    return [new Date(y, 0, 1), new Date(y + this.years - 1, 11, 31)];
  }
}
