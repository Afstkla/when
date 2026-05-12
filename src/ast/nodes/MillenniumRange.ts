import { EraRange } from '../EraRange.js';

/** 3rd millennium = 2000–2999. */
export class MillenniumRange extends EraRange {
  constructor(public readonly n: number) {
    super();
  }
  protected override get years(): number {
    return 1000;
  }
  protected override get firstYear(): number {
    return (this.n - 1) * 1000;
  }
}
