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
    // "this monday": today is Tue, so monday is "earlier this week"; semantics
    // round forward to next monday (diff < 0 → diff += 7).
    expect(fmt('this monday')).toBe('single 2026-05-18');
    // "last tuesday": today IS tuesday (diff = 0); semantics round back 7 days.
    expect(fmt('last tuesday')).toBe('single 2026-05-05');
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
    expect(fmt('last 2 years')).toBe('range 2024-05-13 → 2026-05-12');
    expect(fmt('next 2 quarters')).toBe('range 2026-05-12 → 2026-11-11');
    expect(fmt('last 3 millennia')).toBe('range -0974-05-13 → 2026-05-12');
    expect(fmt('next 2 decades')).toBe('range 2026-05-12 → 2046-05-11');
    expect(fmt('last 2 centuries')).toBe('range 1826-05-13 → 2026-05-12');
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

  it('directional past holidays — covers ref < anchor branches', () => {
    // valentine's day 2026 (Feb 14) is past on May 12 2026
    expect(fmt('this valentines day')).toBe('single 2027-02-14');
    expect(fmt('next valentines day')).toBe('single 2028-02-14');
    expect(fmt('last easter')).toBe('single 2026-04-05');
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

describe('boundaries (start/end/mid/early/late of …)', () => {
  it('parses "<bound> of <month>" with optional year (BoundOfMonth)', () => {
    expect(fmt('start of march')).toBe('single 2026-03-01');
    expect(fmt('end of december')).toBe('single 2026-12-31');
    expect(fmt('mid june')).toBe('single 2026-06-15');
    expect(fmt('early may')).toBe('single 2026-05-05');
    expect(fmt('late november')).toBe('single 2026-11-25');
    expect(fmt('start of march 2027')).toBe('single 2027-03-01');
    expect(fmt('end of december 2027')).toBe('single 2027-12-31');
  });

  it('parses "<bound> of <period>" (BoundOf early/late/mid)', () => {
    expect(fmt('start of month')).toBe('single 2026-05-01');
    expect(fmt('end of month')).toBe('single 2026-05-31');
    expect(fmt('end of year')).toBe('single 2026-12-31');
    expect(fmt('mid of year')).toBe('single 2026-07-02');
    expect(fmt('early of year')).toBe('single 2026-02-06');
    expect(fmt('late of year')).toBe('single 2026-11-25');
  });
});

describe('quarters and halves (direct tokens)', () => {
  it('parses q1..q4 with and without year', () => {
    expect(fmt('q1 2026')).toBe('range 2026-01-01 → 2026-03-31');
    expect(fmt('q4 2027')).toBe('range 2027-10-01 → 2027-12-31');
    expect(fmt('q1')).toBe('range 2026-01-01 → 2026-03-31');
  });

  it('parses h1/h2 with and without year', () => {
    expect(fmt('h1 2026')).toBe('range 2026-01-01 → 2026-06-30');
    expect(fmt('h2 2027')).toBe('range 2027-07-01 → 2027-12-31');
    expect(fmt('h1')).toBe('range 2026-01-01 → 2026-06-30');
  });
});

describe('NthIn for larger units', () => {
  it('parses Nth quarter/half', () => {
    expect(fmt('1st quarter of 2027')).toBe('range 2027-01-01 → 2027-03-31');
    expect(fmt('2nd half of 2027')).toBe('range 2027-07-01 → 2027-12-31');
  });

  it('parses Nth century inside a millennium', () => {
    expect(fmt('1st century of 2nd millennium')).toBe('range 1000-01-01 → 1099-12-31');
  });

  it('returns null for an unsatisfiable Nth', () => {
    expect(parse('20th friday of october 2027', { today: TODAY })).toBeNull();
  });

  it('parses Nth business day inside a container', () => {
    // Jan 1 2027 = Fri (a business day); count: Fri(1), Mon(2), Tue(3), Wed(4), Thu(5)
    expect(fmt('1st business day of 2027')).toBe('single 2027-01-01');
    expect(fmt('5th business day of 2027')).toBe('single 2027-01-07');
    expect(fmt('last business day of 2027')).toBe('single 2027-12-31');
  });

  it('returns null when N exceeds business-day count in the container', () => {
    expect(parse('100th business day of january 2027', { today: TODAY })).toBeNull();
  });

  it('parses Nth millennium inside a millennium container (degenerate but consistent)', () => {
    expect(fmt('1st millennium of 4th millennium')).toBe('range 3000-01-01 → 3999-12-31');
  });
});

describe('solstice and equinox (next-occurrence semantics)', () => {
  it('picks the upcoming solstice/equinox from a given today', () => {
    // From May 12 2026: next solstice = summer (Jun 21), next equinox = autumnal (Sep 22)
    expect(fmt('solstice')).toBe('single 2026-06-21');
    expect(fmt('equinox')).toBe('single 2026-09-22');
  });

  it('rolls solstice across each occurrence', () => {
    expect(isoFormat(parse('solstice', { today: new Date(2026, 6, 1) })!.start)).toBe('2026-12-21');
    expect(isoFormat(parse('solstice', { today: new Date(2026, 11, 25) })!.start)).toBe(
      '2027-06-21',
    );
  });

  it('rolls equinox across each occurrence', () => {
    expect(isoFormat(parse('equinox', { today: new Date(2026, 0, 15) })!.start)).toBe('2026-03-20');
    expect(isoFormat(parse('equinox', { today: new Date(2026, 10, 1) })!.start)).toBe('2027-03-20');
  });
});

describe('shifts on larger units', () => {
  it('shifts by quarter/half/year/decade/century/millennium', () => {
    expect(fmt('today + 1 quarter')).toBe('single 2026-08-12');
    expect(fmt('today + 1 half')).toBe('single 2026-11-12');
    expect(fmt('today + 1 year')).toBe('single 2027-05-12');
    expect(fmt('today + 1 decade')).toBe('single 2036-05-12');
    expect(fmt('today - 1 century')).toBe('single 1926-05-12');
    expect(fmt('today + 1 millennium')).toBe('single 3026-05-12');
  });
});

describe('windows on every unit', () => {
  it('covers week / month / quarter / half forward and backward', () => {
    expect(fmt('next 2 weeks')).toBe('range 2026-05-12 → 2026-05-25');
    expect(fmt('last 3 weeks')).toBe('range 2026-04-22 → 2026-05-12');
    expect(fmt('next 4 months')).toBe('range 2026-05-12 → 2026-09-11');
    expect(fmt('last 4 months')).toBe('range 2026-01-13 → 2026-05-12');
    expect(fmt('last 2 quarters')).toBe('range 2025-11-13 → 2026-05-12');
    expect(fmt('next 2 halves')).toBe('range 2026-05-12 → 2027-05-11');
    expect(fmt('last 2 halves')).toBe('range 2025-05-13 → 2026-05-12');
  });
});

describe('this/next/last for day and half and millennium', () => {
  it('parses Period for day / half / millennium', () => {
    expect(fmt('next day')).toBe('single 2026-05-13');
    expect(fmt('last day')).toBe('single 2026-05-11');
    expect(fmt('this half')).toBe('range 2026-01-01 → 2026-06-30');
    expect(fmt('next half')).toBe('range 2026-07-01 → 2026-12-31');
    expect(fmt('this millennium')).toBe('range 2000-01-01 → 2999-12-31');
    expect(fmt('next millennium')).toBe('range 3000-01-01 → 3999-12-31');
    expect(fmt('last millennium')).toBe('range 1000-01-01 → 1999-12-31');
  });

  it('"this business day" returns today when today is a weekday', () => {
    expect(fmt('this business day')).toBe('single 2026-05-12');
  });

  it('rolls "this business day" forward when today is a weekend', () => {
    // Sat 16 May 2026: skip to Mon 18 May
    expect(isoFormat(parse('this business day', { today: new Date(2026, 4, 16) })!.start)).toBe(
      '2026-05-18',
    );
  });

  it('half period anchors to H2 when today is in the second half', () => {
    // Today Oct 1 2026 → in H2 (Jul-Dec)
    const r = parse('this half', { today: new Date(2026, 9, 1) });
    expect(isoFormat(r!.start)).toBe('2026-07-01');
    expect(isoFormat(r!.end)).toBe('2026-12-31');
  });
});

describe('zodiac sign roll-forward', () => {
  it('rolls a past sign into next year', () => {
    // Aries (Mar 21 – Apr 19) has already passed by May 12 2026.
    expect(fmt('aries')).toBe('range 2027-03-21 → 2027-04-19');
  });
});

describe('weekend "last" on a Sunday today', () => {
  it('walks back past the same weekend to the prior one', () => {
    // Today = Sun 17 May 2026; the prior Saturday is 16 May, which is "this"
    // weekend (still ≤2 days old), so "last weekend" walks one further back.
    const r = parse('last weekend', { today: new Date(2026, 4, 17) });
    expect(r).not.toBeNull();
    expect(isoFormat(r!.start)).toBe('2026-05-09');
    expect(isoFormat(r!.end)).toBe('2026-05-10');
  });
});

describe('slash date with day > 12 in US format', () => {
  it('treats the first part as the day when it must be', () => {
    expect(fmt('15/3/2026')).toBe('single 2026-03-15');
  });
});

describe('invalid month-day combinations', () => {
  it('rejects month + day where day > 31', () => {
    expect(parse('may 35', { today: TODAY })).toBeNull();
    expect(parse('35 may', { today: TODAY })).toBeNull();
  });

  it('rejects numeric dates that roll over', () => {
    // Constructor rolls over (Feb 30 → Mar 2) — tokenizer returns null,
    // so the whole input fails to parse.
    expect(parse('2026-02-30', { today: TODAY })).toBeNull();
    expect(parse('5/35/2026', { today: TODAY })).toBeNull();
    expect(parse('12.35.2026', { today: TODAY })).toBeNull();
  });
});

describe('parser fall-throughs and rare patterns', () => {
  it('"from X" with no connector falls through', () => {
    expect(parse('from monday', { today: TODAY })).toBeNull();
  });
  it('"between X" with no "and" falls through', () => {
    expect(parse('between monday', { today: TODAY })).toBeNull();
  });
  it('continues past mid-sentence relpep', () => {
    expect(parse('5 days ago foo', { today: TODAY })).toBeNull();
  });
  it('parses "UNIT NUMBER YEAR" and "ORD UNIT YEAR"', () => {
    expect(fmt('week 20 2027')).toBe('range 2027-05-10 → 2027-05-16');
    expect(fmt('3rd month 2027')).toBe('range 2027-03-01 → 2027-03-31');
  });
  it('parses "<bound> <month> <year>"', () => {
    expect(fmt('early may 2027')).toBe('single 2027-05-05');
    expect(fmt('late november 2030')).toBe('single 2030-11-25');
  });
  it('parses "Nth UNIT of UNIT" (period-shaped container)', () => {
    expect(fmt('1st week of month')).toBe('range 2026-04-27 → 2026-05-03');
  });
  it('falls through parseAtomLong when inner container fails to parse', () => {
    expect(parse('1st mon of bar', { today: TODAY })).toBeNull();
  });
});

describe('bare-atom parser entries', () => {
  it('bare month → MonthRange this year', () => {
    expect(fmt('march')).toBe('range 2026-03-01 → 2026-03-31');
  });
  it('bare weekend → this weekend', () => {
    expect(fmt('weekend')).toBe('range 2026-05-16 → 2026-05-17');
  });
  it('BOUND_UNIT shorthands (eom / bom / eoy / boy)', () => {
    expect(fmt('eom')).toBe('single 2026-05-31');
    expect(fmt('bom')).toBe('single 2026-05-01');
    expect(fmt('eoy')).toBe('single 2026-12-31');
    expect(fmt('boy')).toBe('single 2026-01-01');
  });
  it('directional month rolls year (next january → 2027, last december → 2025)', () => {
    expect(fmt('next january')).toBe('range 2027-01-01 → 2027-01-31');
    expect(fmt('last december')).toBe('range 2025-12-01 → 2025-12-31');
  });
  it('explicit month + day + year forms', () => {
    expect(fmt('may 12th 2027')).toBe('single 2027-05-12');
    expect(fmt('12 may 2027')).toBe('single 2027-05-12');
    expect(fmt('12th may 2027')).toBe('single 2027-05-12');
    expect(fmt('3rd march')).toBe('single 2026-03-03');
  });
  it('quarter/half/month with explicit year', () => {
    expect(fmt('march 2027')).toBe('range 2027-03-01 → 2027-03-31');
  });
});

describe('attached number+unit tokenizer path', () => {
  it('parses bare "Nu" as NUMBER + UNIT', () => {
    expect(fmt('5d ago')).toBe('single 2026-05-07');
    expect(fmt('in 2w')).toBe('single 2026-05-26');
  });
});

describe('rejects gibberish', () => {
  it('returns null for unparseable input', () => {
    expect(parse('not a date', { today: TODAY })).toBeNull();
    expect(parse('', { today: TODAY })).toBeNull();
    expect(parse('   ', { today: TODAY })).toBeNull();
  });
});
