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

  it('renders tomorrow / yesterday / future / past prose', () => {
    expect(fmt.format(Result.single(new Date(2026, 4, 13)))).toMatch(/Tomorrow is a/);
    expect(fmt.format(Result.single(new Date(2026, 4, 11)))).toMatch(/Yesterday was a/);
    expect(fmt.format(Result.single(new Date(2026, 5, 12)))).toMatch(/from now/);
    expect(fmt.format(Result.single(new Date(2026, 3, 12)))).toMatch(/ago/);
  });

  it('renders ranges within the same ISO week as "week N", not "weeks N–M"', () => {
    const out = fmt.format(Result.range(new Date(2026, 4, 11), new Date(2026, 4, 14)));
    expect(out).toMatch(/week 20/);
    expect(out).not.toMatch(/weeks/);
  });

  it('emits <em> tags inside range output when html=true', () => {
    const html = new ConversationalFormatter({ today: TODAY, html: true }).format(
      Result.range(new Date(2026, 4, 11), new Date(2026, 4, 14)),
    );
    expect(html).toContain('<em>');
  });

  it('renders ranges across years with both years included', () => {
    const out = fmt.format(Result.range(new Date(2025, 11, 1), new Date(2026, 5, 15)));
    expect(out).toMatch(/2025/);
    expect(out).toMatch(/2026/);
  });

  it('falls back to wall-clock today when no `today` option is provided', () => {
    const f = new ConversationalFormatter({}).format(Result.single(new Date()));
    expect(f.length).toBeGreaterThan(0);
  });
});

describe('humanDuration year+days/months variations', () => {
  it('renders 1 year (small remainder)', () => {
    expect(humanDuration(366)).toBe('1 year');
  });
  it('renders 1 year + N days (7 ≤ remainder < 30)', () => {
    expect(humanDuration(380)).toMatch(/^1 year and \d+ days$/);
  });
  it('renders multi-year + months (remainder ≥ 30)', () => {
    expect(humanDuration(365 * 3 + 35)).toMatch(/^[23] years and \d+ months?$/);
  });
});
