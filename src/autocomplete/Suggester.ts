import type { Vocabulary } from '../vocabulary/Vocabulary.js';

/**
 * Ghost-text completion. Returns the rest of the most-likely vocabulary word
 * starting with the input's last token, or an empty string if no confident
 * completion exists.
 *
 * Rank order:
 *   1. Hand-curated "common" priority list (today, next, christmas, …)
 *   2. Shorter words first
 *
 * The completion only fires when the cursor is at the end of input, the last
 * token is ≥ 2 alpha characters, and no completion is shown when the prefix
 * is already a vocabulary word in itself.
 */
export class Suggester {
  private readonly vocab: readonly string[];

  constructor(
    private readonly vocabulary: Vocabulary,
    private readonly commonRank: ReadonlyMap<string, number> = DEFAULT_COMMON_RANK,
  ) {
    const list = new Set<string>();
    for (const phrase of vocabulary.phrases.keys()) {
      if (!phrase.includes(' ')) list.add(phrase);
    }
    this.vocab = [...list];
  }

  suggest(input: string): string {
    if (!input) return '';
    const i = input.lastIndexOf(' ');
    const prefix = input.slice(i + 1).toLowerCase();
    if (prefix.length < 2) return '';
    if (!/^[a-z']+$/.test(prefix)) return '';
    if (this.vocabulary.phrases.has(prefix)) return '';
    const candidates = this.vocab.filter((w) => w.length > prefix.length && w.startsWith(prefix));
    if (!candidates.length) return '';
    candidates.sort((a, b) => {
      const ra = this.commonRank.get(a) ?? 999;
      const rb = this.commonRank.get(b) ?? 999;
      if (ra !== rb) return ra - rb;
      return a.length - b.length;
    });
    return (candidates[0] as string).slice(prefix.length);
  }
}

const DEFAULT_COMMON_RANK: ReadonlyMap<string, number> = new Map(
  [
    'today',
    'tomorrow',
    'yesterday',
    'tmrw',
    'yday',
    'next',
    'last',
    'this',
    'from',
    'to',
    'in',
    'before',
    'after',
    'ago',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
    'week',
    'month',
    'year',
    'weekend',
    'christmas',
    'thanksgiving',
    'easter',
    'halloween',
    'valentines',
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ].map((w, i) => [w, i]),
);
