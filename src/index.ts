/**
 * `when-parser` — public API.
 *
 * The simplest path is the default `parse` function:
 *
 *     import { parse } from 'when-parser';
 *     const result = parse('next fri + 3 days');
 *
 * For more control (locale, custom today, reusable instance):
 *
 *     import { Parser, English } from 'when-parser';
 *     const p = new Parser(English);
 *     const result = p.parse('volgende vrijdag', { today: new Date('2026-05-12') });
 */

import type { AstNode } from './ast/AstNode.js';
import { startOfDay } from './dates.js';
import { Parser } from './parser/Parser.js';
import type { EvalContext, WhenResult } from './types.js';
import { English } from './vocabulary/en.js';
import type { Vocabulary } from './vocabulary/Vocabulary.js';

export interface ParseOptions {
  /** Vocabulary / locale. Defaults to English. */
  readonly vocabulary?: Vocabulary;
  /** Reference "today" date for relative expressions. Defaults to now (local midnight). */
  readonly today?: Date;
}

export interface ParseResult {
  readonly kind: 'single' | 'range';
  readonly start: Date;
  readonly end: Date;
  /** The AST that produced this result — useful for debugging / introspection. */
  readonly ast: AstNode;
  /** The original input. */
  readonly input: string;
}

/**
 * Parse a natural-language date phrase. Returns null for unrecognised input.
 * Uses English by default; pass `options.vocabulary` for other locales.
 */
export function parse(input: string, options: ParseOptions = {}): ParseResult | null {
  const vocab = options.vocabulary ?? English;
  const parser = new Parser(vocab);
  const today = options.today ? startOfDay(options.today) : startOfDay(new Date());
  const ast = parser.parse(input, { today });
  if (!ast) return null;
  const ctx: EvalContext = { today };
  const result: WhenResult | null = ast.evaluate(ctx);
  if (!result) return null;
  return {
    kind: result.kind,
    start: result.start,
    end: result.end,
    ast,
    input,
  };
}

// — AST —
export * from './ast/index.js';
export { Suggester } from './autocomplete/index.js';
// — utilities —
export * from './dates.js';
export { ConversationalFormatter, humanDuration } from './formatter/index.js';
export type { MoonPhaseName } from './moon.js';
export { moonClipPath, moonName, moonPhase } from './moon.js';
// — primary exports —
export { Parser } from './parser/Parser.js';
export { levenshtein, SpellChecker } from './spellcheck/index.js';
export { Token, Tokenizer } from './tokenizer/index.js';
// — types —
export type {
  Bound,
  Direction,
  EvalContext,
  HolidayDefinition,
  MonthIndex,
  RangeResult,
  SingleResult,
  TimeUnit,
  WeekdayIndex,
  WhenResult,
  ZodiacDefinition,
} from './types.js';
export { Result } from './types.js';
// — vocabulary —
export { English } from './vocabulary/en.js';
export type { TokenSpec, Vocabulary } from './vocabulary/Vocabulary.js';
