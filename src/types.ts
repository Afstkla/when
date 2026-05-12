/**
 * Core types shared across the parser, AST, and evaluator.
 *
 * The library is structured as three layers:
 *   1. {@link Tokenizer}: string → {@link Token}[]
 *   2. {@link Parser}:    {@link Token}[] → {@link AstNode}
 *   3. AST nodes:        evaluate themselves against an {@link EvalContext} → {@link WhenResult}
 */

/** Indivisible units of time understood by the parser. */
export type TimeUnit =
  | 'day'
  | 'businessDay'
  | 'week'
  | 'month'
  | 'quarter'
  | 'half'
  | 'year'
  | 'decade'
  | 'century'
  | 'millennium';

/** Directional modifiers (this/next/last and their aliases). */
export interface Direction {
  readonly sign: -1 | 0 | 1;
  readonly kind: 'this' | 'next' | 'last';
}

/** Mon=1, Tue=2, ..., Sun=0 (matching JavaScript's `Date#getDay`). */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Jan=0, Feb=1, ..., Dec=11 (matching `Date#getMonth`). */
export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** Boundary words for "start of X", "end of X", "mid X", etc. */
export type Bound = 'start' | 'end' | 'mid' | 'early' | 'late';

/**
 * Holidays come in three flavors:
 *   - `fixed`:   Christmas (Dec 25 every year)
 *   - `nth`:     Thanksgiving (4th Thursday of Nov)
 *   - `easter`:  Good Friday (Easter ± offset)
 *   - `solstice`/`equinox`: next-occurrence semantics
 */
export type HolidayDefinition =
  | { readonly type: 'fixed'; readonly month: MonthIndex; readonly day: number }
  | {
      readonly type: 'nth';
      readonly month: MonthIndex;
      readonly weekday: WeekdayIndex;
      readonly nth: number;
    }
  | { readonly type: 'easter'; readonly offset: number }
  | { readonly type: 'solstice' }
  | { readonly type: 'equinox' };

/** Zodiac date boundaries (`wraps` = true for Capricorn, spanning the year edge). */
export interface ZodiacDefinition {
  readonly startM: MonthIndex;
  readonly startD: number;
  readonly endM: MonthIndex;
  readonly endD: number;
  readonly wraps?: boolean;
}

/** Context passed into AST evaluation — primarily “what counts as today.” */
export interface EvalContext {
  /** Today, at local-midnight precision. */
  readonly today: Date;
}

/** The result of evaluating any AST node. */
export type WhenResult = SingleResult | RangeResult;

export interface SingleResult {
  readonly kind: 'single';
  readonly start: Date;
  readonly end: Date;
}

export interface RangeResult {
  readonly kind: 'range';
  readonly start: Date;
  readonly end: Date;
}

/** Convenience constructors. */
export const Result = {
  single(date: Date): SingleResult {
    return { kind: 'single', start: date, end: date };
  },
  range(start: Date, end: Date): RangeResult {
    const [lo, hi] = start <= end ? [start, end] : [end, start];
    return { kind: 'range', start: lo, end: hi };
  },
} as const;
