import { MonthBlockRange } from '../MonthBlockRange.js';

export class HalfRange extends MonthBlockRange {
  /** 0-indexed half: H1 = 0, H2 = 1. */
  constructor(
    public readonly h: number,
    public readonly yearValue: number,
  ) {
    super();
  }
  protected override get firstMonth(): number {
    return this.h * 6;
  }
  protected override get monthSpan(): number {
    return 6;
  }
  protected override get year(): number {
    return this.yearValue;
  }
}
