import { MonthBlockRange } from '../MonthBlockRange.js';

export class QuarterRange extends MonthBlockRange {
  /** 0-indexed quarter: Q1 = 0, Q2 = 1, Q3 = 2, Q4 = 3. */
  constructor(
    public readonly q: number,
    public readonly yearValue: number,
  ) {
    super();
  }
  protected override get firstMonth(): number {
    return this.q * 3;
  }
  protected override get monthSpan(): number {
    return 3;
  }
  protected override get year(): number {
    return this.yearValue;
  }
}
