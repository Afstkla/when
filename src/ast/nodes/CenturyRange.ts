import { EraRange } from '../EraRange.js';

/** Common-usage convention: 21st century = 2000–2099. */
export class CenturyRange extends EraRange {
  constructor(public readonly n: number) {
    super();
  }
  protected override get years(): number {
    return 100;
  }
  protected override get firstYear(): number {
    return (this.n - 1) * 100;
  }
}
