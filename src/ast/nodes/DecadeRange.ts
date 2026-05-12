import { EraRange } from '../EraRange.js';

export class DecadeRange extends EraRange {
  constructor(public readonly decade: number) {
    super();
  }
  protected override get years(): number {
    return 10;
  }
  protected override get firstYear(): number {
    return this.decade;
  }
}
