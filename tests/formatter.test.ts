import { describe, expect, it } from 'vitest';
import { ConversationalFormatter, humanDuration, Result } from '../src/index.js';

const TODAY = new Date(2026, 4, 12);

describe('humanDuration', () => {
  it('renders day/week/year scales', () => {
    expect(humanDuration(1)).toBe('1 day');
    expect(humanDuration(45)).toBe('45 days');
    expect(humanDuration(70)).toBe('10 weeks');
    expect(humanDuration(365)).toMatch(/year/);
    expect(humanDuration(365 + 30)).toMatch(/year.*month/);
  });
});

describe('ConversationalFormatter', () => {
  const fmt = new ConversationalFormatter({ today: TODAY });

  it('renders single dates with weekday + week + moon', () => {
    expect(fmt.format(Result.single(TODAY))).toMatch(/Tuesday.*week 20/);
  });

  it('renders ranges with duration and end weeks', () => {
    const r = Result.range(new Date(1990, 0, 1), TODAY);
    const out = fmt.format(r);
    expect(out).toMatch(/years/);
    expect(out).toMatch(/Mon.*1 January 1990/);
    expect(out).toMatch(/Tue.*12 May 2026/);
    expect(out).toMatch(/weeks/);
  });

  it('returns empty string for null', () => {
    expect(fmt.format(null)).toBe('');
  });

  it('emits HTML emphasis when requested', () => {
    const html = new ConversationalFormatter({ today: TODAY, html: true }).format(
      Result.single(TODAY),
    );
    expect(html).toContain('<em>');
  });
});
