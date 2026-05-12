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
});
