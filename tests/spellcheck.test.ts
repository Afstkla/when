import { describe, expect, it } from 'vitest';
import { English, levenshtein, Parser, SpellChecker } from '../src/index.js';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc', 3)).toBe(0);
  });

  it('counts substitutions, insertions, deletions', () => {
    expect(levenshtein('kitten', 'sitting', 5)).toBe(3);
    expect(levenshtein('a', '', 5)).toBe(1);
    expect(levenshtein('', 'abc', 5)).toBe(3);
  });

  it('respects the cap with early exit', () => {
    expect(levenshtein('abcdefg', 'qrstuvw', 2)).toBe(3);
  });

  it('bails when length diff exceeds cap', () => {
    expect(levenshtein('a', 'abcdefg', 1)).toBe(2);
  });
});

describe('SpellChecker', () => {
  const parser = new Parser(English);
  const checker = new SpellChecker(English, parser);

  it('corrects typos that round-trip through the parser', () => {
    expect(checker.suggest('thnaksgiving')).toBe('thanksgiving');
    expect(checker.suggest('tomorow')).toBe('tomorrow');
    expect(checker.suggest('frday')).toBe('friday');
  });

  it('refuses ambiguous corrections', () => {
    // "may" is already a vocabulary word — no correction needed
    expect(checker.suggest('may')).toBeNull();
  });

  it('returns null when no correction produces a parseable phrase', () => {
    expect(checker.suggest('xyzpdq')).toBeNull();
  });

  it('skips tokens shorter than 3 chars and non-alpha tokens', () => {
    expect(checker.suggest('ag 12 zz')).toBeNull();
    // 3+ chars but contains digit — fails the alpha regex on line 46
    expect(checker.suggest('a1b')).toBeNull();
  });

  it('rejects ambiguous corrections with similar runner-up', () => {
    // "mat" is dist 1 from at least may/sat/mar — runner-up ties best.
    expect(checker.suggest('mat')).toBeNull();
  });

  it('returns null when the corrected phrase still does not parse', () => {
    // "thnaksgiving" corrects to "thanksgiving"; "qz" is too short to correct;
    // "thanksgiving qz" doesn't parse as a date.
    expect(checker.suggest('thnaksgiving qz')).toBeNull();
  });
});
