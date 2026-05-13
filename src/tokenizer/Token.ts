/**
 * A `Token` is a typed slice of input — output of the tokenizer, input of
 * the parser. Tokens cover both vocabulary-driven words (the `TokenSpec` shapes
 * from a `Vocabulary`) and tokenizer-generated kinds (`NUMBER`, `YEAR`,
 * `DATE`, `DASH`, `QUARTER`, `HALF`, `DECADE`, `WORD`).
 */

import type { TokenSpec } from '../vocabulary/Vocabulary.js';

/** Token kinds produced by the tokenizer in addition to vocabulary lookups. */
export type TokenizerTokenSpec =
  | { type: 'NUMBER'; value: number }
  | { type: 'YEAR'; value: number }
  | { type: 'DATE'; value: Date }
  | { type: 'DASH' }
  | { type: 'QUARTER'; value: number }
  | { type: 'HALF'; value: number }
  | { type: 'DECADE'; value: number }
  | { type: 'WORD' };

export type AnyTokenSpec = TokenSpec | TokenizerTokenSpec;

export type TokenType = AnyTokenSpec['type'];

export class Token {
  constructor(
    public readonly spec: AnyTokenSpec,
    public readonly raw: string,
  ) {}
}
