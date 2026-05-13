import { describe, expect, it } from 'vitest';
import { isoFormat } from '../src/dates.js';
import { parse } from '../src/index.js';

const TODAY = new Date(2026, 4, 12); // Tue 12 May 2026

function fmt(s: string): string {
  const r = parse(s, { today: TODAY });
  if (!r) return 'FAIL';
  return r.kind === 'range'
    ? `range ${isoFormat(r.start)} → ${isoFormat(r.end)}`
    : `single ${isoFormat(r.start)}`;
}

describe('literals', () => {
  it('parses today/tomorrow/yesterday and their abbreviations', () => {
    expect(fmt('today')).toBe('single 2026-05-12');
    expect(fmt('tdy')).toBe('single 2026-05-12');
    expect(fmt('now')).toBe('single 2026-05-12');
    expect(fmt('tomorrow')).toBe('single 2026-05-13');
    expect(fmt('tmrw')).toBe('single 2026-05-13');
    expect(fmt('tmr')).toBe('single 2026-05-13');
    expect(fmt('yesterday')).toBe('single 2026-05-11');
    expect(fmt('yday')).toBe('single 2026-05-11');
  });

  it('parses compound idioms', () => {
    expect(fmt('day after tomorrow')).toBe('single 2026-05-14');
    expect(fmt('the day after tomorrow')).toBe('single 2026-05-14');
    expect(fmt('day before yesterday')).toBe('single 2026-05-10');
  });
});

describe('weekdays', () => {
  it('parses direction + weekday', () => {
    expect(fmt('next fri')).toBe('single 2026-05-15');
    expect(fmt('last mon')).toBe('single 2026-05-11');
    expect(fmt('this thursday')).toBe('single 2026-05-14');
    expect(fmt('coming sat')).toBe('single 2026-05-16');
  });

  it('parses "N weekdays from now / ago"', () => {
    expect(fmt('2 mondays from now')).toBe('single 2026-05-25');
    expect(fmt('3 fridays ago')).toBe('single 2026-04-24');
  });
});

describe('offsets', () => {
  it('handles +N / -N standalone', () => {
    expect(fmt('+45')).toBe('single 2026-06-26');
    expect(fmt('-7')).toBe('single 2026-05-05');
  });

  it('handles "in N units" and "N units ago"', () => {
    expect(fmt('in 3 weeks')).toBe('single 2026-06-02');
    expect(fmt('3 days ago')).toBe('single 2026-05-09');
    expect(fmt('2 weeks hence')).toBe('single 2026-05-26');
  });

  it('handles attached +5d / +1w / -2mo', () => {
    expect(fmt('+5d')).toBe('single 2026-05-17');
    expect(fmt('+1w')).toBe('single 2026-05-19');
    expect(fmt('-2mo')).toBe('single 2026-03-12');
  });

  it('handles postfix shifts on any anchor', () => {
    expect(fmt('today + 10 days')).toBe('single 2026-05-22');
    expect(fmt('today - 10 days')).toBe('single 2026-05-02');
    expect(fmt('next fri + 3 days')).toBe('single 2026-05-18');
    expect(fmt('first friday of next month +5')).toBe('single 2026-06-10');
    expect(fmt('xmas + 1 week')).toBe('single 2027-01-01');
  });

  it('handles "N units before/after anchor"', () => {
    expect(fmt('10 days before xmas')).toBe('single 2026-12-15');
    expect(fmt('2 weeks after easter')).toBe('single 2027-04-11');
  });
});

describe('windows', () => {
  it('parses "next/last N units"', () => {
    expect(fmt('last 30 days')).toBe('range 2026-04-13 → 2026-05-12');
    expect(fmt('next 7 days')).toBe('range 2026-05-12 → 2026-05-18');
    expect(fmt('past 14 days')).toBe('range 2026-04-29 → 2026-05-12');
  });
});

describe('periods', () => {
  it('parses this/next/last week|month|year|quarter|half', () => {
    expect(fmt('this week')).toBe('range 2026-05-11 → 2026-05-17');
    expect(fmt('next week')).toBe('range 2026-05-18 → 2026-05-24');
    expect(fmt('last week')).toBe('range 2026-05-04 → 2026-05-10');
    expect(fmt('this month')).toBe('range 2026-05-01 → 2026-05-31');
    expect(fmt('this year')).toBe('range 2026-01-01 → 2026-12-31');
    expect(fmt('this quarter')).toBe('range 2026-04-01 → 2026-06-30');
  });

  it('parses aliases (all = this, wk = week, mo = month)', () => {
    expect(fmt('all year')).toBe('range 2026-01-01 → 2026-12-31');
    expect(fmt('all month')).toBe('range 2026-05-01 → 2026-05-31');
    expect(fmt('last wk')).toBe('range 2026-05-04 → 2026-05-10');
    expect(fmt('next mo')).toBe('range 2026-06-01 → 2026-06-30');
    expect(fmt('previous month')).toBe('range 2026-04-01 → 2026-04-30');
    expect(fmt('former wk')).toBe('range 2026-05-04 → 2026-05-10');
    expect(fmt('nxt fri')).toBe('single 2026-05-15');
  });

  it('parses weekend variants', () => {
    expect(fmt('this weekend')).toBe('range 2026-05-16 → 2026-05-17');
    expect(fmt('next weekend')).toBe('range 2026-05-23 → 2026-05-24');
    expect(fmt('weekend after next')).toBe('range 2026-05-23 → 2026-05-24');
  });
});

describe('Nth of … (generalised)', () => {
  it('parses Nth weekday of month', () => {
    expect(fmt('first mon of march')).toBe('single 2026-03-02');
    expect(fmt('last fri of october 2027')).toBe('single 2027-10-29');
  });

  it('parses Nth unit of month', () => {
    expect(fmt('1st week of sept')).toBe('range 2026-08-31 → 2026-09-06');
    expect(fmt('2nd week of september')).toBe('range 2026-09-07 → 2026-09-13');
    expect(fmt('1st day of march')).toBe('single 2026-03-01');
  });

  it('parses Nth unit of year/decade/century', () => {
    expect(fmt('week 20')).toBe('range 2026-05-11 → 2026-05-17');
    expect(fmt('1st month')).toBe('range 2026-01-01 → 2026-01-31');
    expect(fmt('3rd month of 2027')).toBe('range 2027-03-01 → 2027-03-31');
    expect(fmt('5th month of 2020s')).toBe('range 2020-05-01 → 2020-05-31');
    expect(fmt('1st year of 2020s')).toBe('range 2020-01-01 → 2020-12-31');
    expect(fmt('2nd decade of 21st century')).toBe('range 2010-01-01 → 2019-12-31');
    expect(fmt('3rd day of next week')).toBe('single 2026-05-20');
  });
});

describe('eras', () => {
  it('parses bare decade tokens and named eras', () => {
    expect(fmt('2020s')).toBe('range 2020-01-01 → 2029-12-31');
    expect(fmt('1990s')).toBe('range 1990-01-01 → 1999-12-31');
    expect(fmt('21st century')).toBe('range 2000-01-01 → 2099-12-31');
    expect(fmt('3rd millennium')).toBe('range 2000-01-01 → 2999-12-31');
    // Years 0–99 must not get the legacy two-digit-year mapping to 1900–1999.
    expect(fmt('1st century')).toBe('range 0000-01-01 → 0099-12-31');
    expect(fmt('1st millennium')).toBe('range 0000-01-01 → 0999-12-31');
    // Nth-weekday inside an early-era container also dodges the 1900 trap.
    expect(fmt('3rd fri of 1st millennium')).toBe('single 0000-01-21');
  });

  it('parses this/next/last decade|century|millennium', () => {
    expect(fmt('this decade')).toBe('range 2020-01-01 → 2029-12-31');
    expect(fmt('next decade')).toBe('range 2030-01-01 → 2039-12-31');
    expect(fmt('this century')).toBe('range 2000-01-01 → 2099-12-31');
  });
});

describe('holidays', () => {
  it('parses common holidays', () => {
    expect(fmt('christmas')).toBe('single 2026-12-25');
    expect(fmt('xmas')).toBe('single 2026-12-25');
    expect(fmt('halloween')).toBe('single 2026-10-31');
    expect(fmt('thanksgiving')).toBe('single 2026-11-26');
    expect(fmt('juneteenth')).toBe('single 2026-06-19');
    expect(fmt('pi day')).toBe('single 2027-03-14');
  });

  it('computes Easter via Anonymous Gregorian', () => {
    expect(fmt('easter')).toBe('single 2027-03-28');
    expect(fmt('good friday')).toBe('single 2027-03-26');
  });

  it('supports directional holidays', () => {
    expect(fmt('last christmas')).toBe('single 2025-12-25');
    expect(fmt('next thanksgiving')).toBe('single 2027-11-25');
    expect(fmt('this christmas')).toBe('single 2026-12-25');
  });

  it('parses holiday + year', () => {
    expect(fmt('christmas 2023')).toBe('single 2023-12-25');
  });
});

describe('zodiac signs', () => {
  it('parses zodiac signs', () => {
    expect(fmt('scorpio')).toBe('range 2026-10-23 → 2026-11-21');
    expect(fmt('taurus')).toBe('range 2026-04-20 → 2026-05-20');
    expect(fmt('capricorn')).toBe('range 2026-12-22 → 2027-01-19');
    expect(fmt('leo 2027')).toBe('range 2027-07-23 → 2027-08-22');
  });
});

describe('business days', () => {
  it('shifts via +N business days', () => {
    expect(fmt('+5b')).toBe('single 2026-05-19');
    expect(fmt('5 business days from now')).toBe('single 2026-05-19');
    expect(fmt('5 working days ago')).toBe('single 2026-05-05');
    expect(fmt('in 3 weekdays')).toBe('single 2026-05-15');
  });

  it('handles next/last business day', () => {
    expect(fmt('next business day')).toBe('single 2026-05-13');
    expect(fmt('next weekday')).toBe('single 2026-05-13');
    expect(fmt('last business day')).toBe('single 2026-05-11');
  });

  it('builds windows of business days', () => {
    expect(fmt('next 10 business days')).toBe('range 2026-05-12 → 2026-05-25');
    expect(fmt('last 5 business days')).toBe('range 2026-05-06 → 2026-05-12');
  });
});

describe('month-day combinations', () => {
  it('parses month + day (both orders)', () => {
    expect(fmt('may 12')).toBe('single 2026-05-12');
    expect(fmt('12 may')).toBe('single 2026-05-12');
    expect(fmt('may 12 2026')).toBe('single 2026-05-12');
    expect(fmt('12 of may')).toBe('single 2026-05-12');
    expect(fmt('may 12th')).toBe('single 2026-05-12');
  });

  it('parses numeric date formats', () => {
    expect(fmt('2026-05-12')).toBe('single 2026-05-12');
    expect(fmt('5/12/26')).toBe('single 2026-05-12');
    expect(fmt('12.5.2026')).toBe('single 2026-05-12');
  });
});

describe('ranges', () => {
  it('parses X to Y', () => {
    expect(fmt('yday to tmrw')).toBe('range 2026-05-11 → 2026-05-13');
    // Weekday tokens resolve to the next occurrence, so on a Tuesday this
    // becomes "next-or-today Mon" (May 18) → "next-or-today Fri" (May 15);
    // the range normalises to [earlier, later].
    expect(fmt('from monday to friday')).toBe('range 2026-05-15 → 2026-05-18');
  });

  it('parses "may 12 - 19" with bare-number completion', () => {
    expect(fmt('may 12 - 19')).toBe('range 2026-05-12 → 2026-05-19');
  });

  it('parses "between X and Y"', () => {
    expect(fmt('between jul 1 and aug 15')).toBe('range 2026-07-01 → 2026-08-15');
  });
});

describe('article-stripping', () => {
  it('drops "the" while preserving idioms', () => {
    expect(fmt('the day after tomorrow')).toBe('single 2026-05-14');
    expect(fmt('the next monday')).toBe('single 2026-05-18');
    expect(fmt('the 2nd week of the 2020s')).toBe('range 2020-01-06 → 2020-01-12');
  });
});

describe('rejects gibberish', () => {
  it('returns null for unparseable input', () => {
    expect(parse('not a date', { today: TODAY })).toBeNull();
    expect(parse('', { today: TODAY })).toBeNull();
    expect(parse('   ', { today: TODAY })).toBeNull();
  });
});
