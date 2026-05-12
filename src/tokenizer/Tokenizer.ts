/**
 * The tokenizer is two passes:
 *
 *   1. {@link normalize}: lowercase, collapse whitespace/punctuation, then run
 *      a small set of locale-agnostic *structural* rewrites that aren't worth
 *      teaching the parser (`from now` → `__forward__` sentinel, articles
 *      dropped, etc.).
 *
 *   2. {@link tokenize}: scan word-by-word with a sliding window. At each
 *      position, try the longest possible phrase against the locale's
 *      {@link Vocabulary}; if no phrase matches, fall back to numeric and
 *      date-format detection.
 *
 * All locale-specific knowledge lives in the `Vocabulary`. The tokenizer
 * itself is language-neutral.
 */

import type { Vocabulary } from '../vocabulary/Vocabulary.js';
import { Token } from './Token.js';

/** Result of `parseDate` calls — keeps the tokenizer self-contained. */
function tryISO(w: string): Date | null {
  const m = w.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m || m[1] === undefined || m[2] === undefined || m[3] === undefined) return null;
  const y = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, month, day);
  return d.getMonth() === month && d.getDate() === day ? d : null;
}

function trySlashDate(
  w: string,
  dateFormat: Vocabulary['dateFormat'],
  todayYear: number,
): Date | null {
  const m = w.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m || m[1] === undefined || m[2] === undefined) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  const y = m[3] === undefined ? todayYear : m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  let month: number;
  let day: number;
  if (dateFormat === 'eu') {
    day = a;
    month = b - 1;
  } else if (a > 12) {
    // No matter the format, if the first part > 12 it has to be the day
    day = a;
    month = b - 1;
  } else {
    month = a - 1;
    day = b;
  }
  const d = new Date(y, month, day);
  return d.getMonth() === month && d.getDate() === day ? d : null;
}

function tryDotDate(w: string, todayYear: number): Date | null {
  const m = w.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
  if (!m || m[1] === undefined || m[2] === undefined) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const y = m[3] === undefined ? todayYear : m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(y, month, day);
  return d.getMonth() === month && d.getDate() === day ? d : null;
}

export interface TokenizerOptions {
  /** Source of "today" — defaults to current local midnight. Helps testing. */
  readonly today?: Date;
}

export class Tokenizer {
  private readonly maxPhraseWords: number;

  constructor(private readonly vocabulary: Vocabulary) {
    let max = 1;
    for (const phrase of vocabulary.phrases.keys()) {
      const n = phrase.split(' ').length;
      if (n > max) max = n;
    }
    this.maxPhraseWords = max;
  }

  /**
   * Cleans whitespace and punctuation, applies the locale's rewrites, then
   * strips articles. Article removal runs last so multi-word idioms that
   * contain an article ("the day after tomorrow") still resolve via the
   * vocabulary map.
   */
  normalize(input: string): string {
    let s = input
      .toLowerCase()
      .replace(/[,!?]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    for (const [pattern, replacement] of this.vocabulary.rewrites) {
      s = s.replace(pattern, replacement);
    }

    if (this.vocabulary.articles.size > 0) {
      const pattern = new RegExp(
        `\\b(?:${Array.from(this.vocabulary.articles).join('|')})\\b`,
        'g',
      );
      s = s.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
    }

    return s;
  }

  /** Tokenize the input, with multi-word vocabulary support. */
  tokenize(input: string, options: TokenizerOptions = {}): Token[] {
    const today = options.today ?? new Date();
    const todayYear = today.getFullYear();
    const s = this.normalize(input);
    if (!s) return [];

    const words = s.split(' ');
    const tokens: Token[] = [];
    let i = 0;
    while (i < words.length) {
      // Try multi-word vocabulary phrases (longest first).
      let matched = false;
      const maxLookahead = Math.min(this.maxPhraseWords, words.length - i);
      for (let n = maxLookahead; n >= 1; n--) {
        const phrase = words.slice(i, i + n).join(' ');
        const spec = this.vocabulary.phrases.get(phrase);
        if (spec) {
          tokens.push(new Token(spec, phrase));
          i += n;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Single-word fallback (numbers, dates, sentinels).
      const word = words[i];
      if (word === undefined) {
        i++;
        continue;
      }
      const single = this.classifySingle(word, todayYear);
      if (Array.isArray(single)) tokens.push(...single);
      else if (single) tokens.push(single);
      i++;
    }
    return tokens;
  }

  private classifySingle(w: string, todayYear: number): Token | Token[] | null {
    if (!w) return null;

    if (w === '__forward__') return new Token({ type: 'FROMNOW' }, w);

    const iso = tryISO(w);
    if (iso) return new Token({ type: 'DATE', value: iso }, w);

    const slash = trySlashDate(w, this.vocabulary.dateFormat, todayYear);
    if (slash) return new Token({ type: 'DATE', value: slash }, w);

    const dot = tryDotDate(w, todayYear);
    if (dot) return new Token({ type: 'DATE', value: dot }, w);

    let m: RegExpMatchArray | null;
    // Quarter / half (q1..q4, h1, h2)
    if ((m = w.match(/^q([1-4])$/)))
      return new Token({ type: 'QUARTER', value: Number(m[1]) - 1 }, w);
    if ((m = w.match(/^h([12])$/))) return new Token({ type: 'HALF', value: Number(m[1]) - 1 }, w);

    // Decade shorthand: "2020s", "1990s"
    if ((m = w.match(/^(\d{4})s$/))) {
      const y = Number(m[1]);
      if (y >= 1000 && y <= 2900 && y % 10 === 0) {
        return new Token({ type: 'DECADE', value: y }, w);
      }
    }

    // Signed numbers: "+5", "-7", "+1w", "-2mo" — split into OP+NUMBER(+UNIT)
    if ((m = w.match(/^([+-])(\d+)([a-z]+)?$/))) {
      const sign = m[1] === '+' ? 1 : -1;
      const num = Number(m[2]);
      const tokens: Token[] = [
        new Token({ type: 'OP', value: sign as 1 | -1 }, m[1] ?? ''),
        new Token({ type: 'NUMBER', value: num }, m[2] ?? ''),
      ];
      if (m[3] !== undefined) {
        const unitSpec = this.vocabulary.phrases.get(m[3]);
        if (!unitSpec || unitSpec.type !== 'UNIT') return null;
        tokens.push(new Token(unitSpec, m[3]));
      }
      return tokens;
    }

    // Attached number+unit: "5d", "10w", "3mo" (but not ordinals like "5th")
    if (!/(st|nd|rd|th)$/.test(w) && (m = w.match(/^(\d+)([a-z]+)$/))) {
      const unitSpec = this.vocabulary.phrases.get(m[2] ?? '');
      if (unitSpec && unitSpec.type === 'UNIT') {
        return [
          new Token({ type: 'NUMBER', value: Number(m[1]) }, m[1] ?? ''),
          new Token(unitSpec, m[2] ?? ''),
        ];
      }
    }

    // Ordinal numerals: "1st", "2nd", "23rd"
    if ((m = w.match(this.vocabulary.ordinalSuffix))) {
      return new Token({ type: 'ORD', value: Number(m[1]) }, w);
    }

    // Year (4-digit in plausible range)
    if (/^\d{4}$/.test(w)) {
      const y = Number(w);
      if (y >= 1000 && y <= 2900) return new Token({ type: 'YEAR', value: y }, w);
    }

    // Bare integer
    if (/^\d+$/.test(w)) {
      return new Token({ type: 'NUMBER', value: Number(w) }, w);
    }

    // Operators / dashes
    if (w === '+') return new Token({ type: 'OP', value: 1 }, w);
    if (w === '-' || w === '–' || w === '—') return new Token({ type: 'DASH' }, w);

    return new Token({ type: 'WORD' }, w);
  }
}
