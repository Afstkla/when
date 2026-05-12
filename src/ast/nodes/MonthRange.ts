import { MonthBlockRange } from '../MonthBlockRange.js';

export class MonthRange extends MonthBlockRange {
  constructor(
    public readonly month: number,
    public readonly yearValue: number,
  ) {
    super();
  }
  protected override get firstMonth(): number {
    return this.month;
  }
  protected override get monthSpan(): number {
    return 1;
  }
  protected override get year(): number {
    return this.yearValue;
  }
}
