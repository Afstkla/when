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
    return [makeYearDate(y, 0, 1), makeYearDate(y + this.years - 1, 11, 31)];
  }
}

// The `Date` constructor maps two-digit years 0–99 to 1900–1999.
// `setFullYear` writes the literal year, which matters for the 1st millennium
// (years 0–999) and the 1st century (years 0–99).
function makeYearDate(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day);
  d.setFullYear(year, month, day);
  return d;
}
