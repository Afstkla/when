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
});
