/**
 * A `Vocabulary` is everything the tokenizer needs to recognise words and
 * phrases in a given language: directions, units, weekdays, months, holidays,
 * zodiac signs, connectives, etc.
 *
 * Each entry is a phrase (single or multi-word) mapped to a typed `TokenSpec`.
 * The tokenizer probes longest-first when scanning the input, so multi-word
 * entries like `business day` and `valentine's day` are matched ahead of
 * shorter prefixes.
 *
 * The architecture is deliberately a single phrase map: adding a new locale
 * means providing a new `Vocabulary` object — no parser code changes.
 */

import type {
  Bound,
  Direction,
  HolidayDefinition,
  MonthIndex,
  TimeUnit,
  WeekdayIndex,
  ZodiacDefinition,
} from '../types.js';

/** A token's semantic content (everything except the surface text). */
export type TokenSpec =
  | { readonly type: 'DIR'; readonly value: Direction }
  | { readonly type: 'UNIT'; readonly value: TimeUnit }
  | { readonly type: 'WEEKDAY'; readonly value: WeekdayIndex }
  | { readonly type: 'MONTH'; readonly value: MonthIndex }
  | { readonly type: 'ORD'; readonly value: number }
  | { readonly type: 'HOLIDAY'; readonly value: string; readonly def: HolidayDefinition }
  | { readonly type: 'ZODIAC'; readonly value: string; readonly def: ZodiacDefinition }
  /** Day-offset literal: 0 = today, 1 = tomorrow, -1 = yesterday, etc. */
  | { readonly type: 'LIT'; readonly value: number }
  | { readonly type: 'WEEKEND' }
  | { readonly type: 'CONN' }
  | { readonly type: 'FROM' }
  | { readonly type: 'BETWEEN' }
  | { readonly type: 'AND' }
  | { readonly type: 'OF' }
  | { readonly type: 'IN' }
  | { readonly type: 'OP'; readonly value: 1 | -1 }
  | {
      readonly type: 'RELPREP';
      readonly value: 'ago' | 'before' | 'after' | 'hence' | 'later' | 'ahead';
    }
  | { readonly type: 'BOUND'; readonly value: Bound }
  | { readonly type: 'BOUND_UNIT'; readonly bound: Bound; readonly unit: TimeUnit }
  | { readonly type: 'FROMNOW' };

export interface Vocabulary {
  /** Lowercased phrase → token spec. Phrases may contain spaces (multi-word). */
  readonly phrases: ReadonlyMap<string, TokenSpec>;
  /**
   * Words that should be silently dropped during normalization (e.g. "the" in
   * English). The tokenizer strips these after multi-word phrases are matched,
   * so idioms containing articles still resolve.
   */
  readonly articles: ReadonlySet<string>;
  /** Date-format hint for ambiguous slash dates like `5/12`. */
  readonly dateFormat: 'us' | 'eu' | 'iso';
  /** Ordinal-suffix regex — anchored, matches the trailing letters of "1st", "2nd", etc. */
  readonly ordinalSuffix: RegExp;
  /** Human-readable name of the locale (used in tooling, never user-facing logic). */
  readonly id: string;
}
