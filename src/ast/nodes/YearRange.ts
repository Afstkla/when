import { EraRange } from '../EraRange.js';

export class YearRange extends EraRange {
  constructor(public readonly year: number) {
    super();
  }
  protected override get years(): number {
    return 1;
  }
  protected override get firstYear(): number {
    return this.year;
  }
}
