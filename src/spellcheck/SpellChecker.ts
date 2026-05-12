import type { Parser } from '../parser/Parser.js';
import type { Vocabulary } from '../vocabulary/Vocabulary.js';
import { levenshtein } from './levenshtein.js';

/**
 * Token-level spell correction: when the input fails to parse, swap each
 * unknown token for the closest vocabulary word (within a length-aware edit
 * distance cap) and retry. Returns the corrected phrase only if it actually
 * parses, so suggestions are guaranteed to resolve to a date.
 */
export class SpellChecker {
  private readonly vocab: readonly string[];

  constructor(
    private readonly vocabulary: Vocabulary,
    private readonly parser: Parser,
  ) {
    // Extract just the single-word entries; multi-word phrases are unlikely
    // to be helpful for token-level correction (you'd need phrase matching).
    const words = new Set<string>();
    for (const phrase of vocabulary.phrases.keys()) {
      if (!phrase.includes(' ')) words.add(phrase);
    }
    this.vocab = [...words];
  }

  /** Returns the corrected input, or null if no good suggestion was found. */
  suggest(input: string): string | null {
    const tokens = input.toLowerCase().split(/\s+/);
    let changed = false;
    const fixed = tokens.map((t) => {
      const c = this.correctToken(t);
      if (c && c !== t) {
        changed = true;
        return c;
      }
      return t;
    });
    if (!changed) return null;
    const candidate = fixed.join(' ');
    return this.parser.parse(candidate) ? candidate : null;
  }

  private correctToken(tok: string): string | null {
    if (tok.length < 3) return null;
    if (!/^[a-z']+$/.test(tok)) return null;
    if (this.vocabulary.phrases.has(tok)) return null;
    const cap = tok.length <= 4 ? 1 : tok.length <= 7 ? 2 : 3;
    let best: string | null = null;
    let bestDist = cap + 1;
    let runnerUp = cap + 1;
    for (const w of this.vocab) {
      if (Math.abs(w.length - tok.length) > cap) continue;
      const d = levenshtein(tok, w, cap);
      if (d < bestDist) {
        runnerUp = bestDist;
        bestDist = d;
        best = w;
      } else if (d < runnerUp) {
        runnerUp = d;
      }
    }
    if (!best || bestDist > cap) return null;
    // Reject ambiguous corrections — the runner-up must be at least one step worse.
    if (runnerUp - bestDist < 1) return null;
    return best;
  }
}
