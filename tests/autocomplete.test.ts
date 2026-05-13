import { describe, expect, it } from 'vitest';
import { English, Suggester } from '../src/index.js';

describe('Suggester', () => {
  const s = new Suggester(English);

  it('completes the last token', () => {
    expect(s.suggest('thank')).toBe('sgiving');
    expect(s.suggest('chr')).toBe('istmas');
  });

  it('does not fire for single-character prefixes', () => {
    expect(s.suggest('t')).toBe('');
  });

  it('returns empty when the prefix is already a vocabulary word', () => {
    expect(s.suggest('today')).toBe('');
    expect(s.suggest('may')).toBe('');
  });

  it('completes the last token even with leading content', () => {
    expect(s.suggest('today + 10 thank')).toBe('sgiving');
  });

  it('ranks multi-candidate prefixes by the common-phrase list', () => {
    // "fr" matches "fri", "friday", "fridays" — the sort comparator must run.
    expect(s.suggest('fr')).not.toBe('');
    // "ja" matches "january" only — single-candidate path.
    expect(s.suggest('ja')).toBe('nuary');
  });

  it('returns empty for empty / non-alpha / unmatched input', () => {
    expect(s.suggest('')).toBe('');
    expect(s.suggest('a1b')).toBe('');
    expect(s.suggest('xyzz')).toBe('');
  });
});
