import { describe, expect, it } from 'vitest';
import {
  addBusinessDays,
  addDays,
  addMonths,
  diffDays,
  easterDate,
  endOfMonth,
  endOfWeekSun,
  isLeapYear,
  isoFormat,
  isoWeek,
  nthWeekdayInMonth,
  ordinalSuffix,
  sameDay,
  startOfMonth,
  startOfWeekMon,
  weekStartOfYear,
  weeksInYear,
} from '../src/dates.js';

describe('addDays / addMonths', () => {
  it('does not mutate the input', () => {
    const d = new Date(2026, 4, 12);
    addDays(d, 10);
    expect(d.getDate()).toBe(12);
  });

  it('clamps month-end dates', () => {
    // Jan 31 + 1 month = Feb 28 (or 29 in leap years)
    expect(isoFormat(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(isoFormat(addMonths(new Date(2024, 0, 31), 1))).toBe('2024-02-29');
  });
});

describe('addBusinessDays', () => {
  it('skips weekends', () => {
    // Fri 2026-05-15 + 1 business day = Mon 2026-05-18
    expect(isoFormat(addBusinessDays(new Date(2026, 4, 15), 1))).toBe('2026-05-18');
    expect(isoFormat(addBusinessDays(new Date(2026, 4, 12), 5))).toBe('2026-05-19');
    expect(isoFormat(addBusinessDays(new Date(2026, 4, 12), -5))).toBe('2026-05-05');
  });
});

describe('startOfMonth / endOfMonth', () => {
  it('returns boundaries', () => {
    const d = new Date(2026, 4, 12);
    expect(isoFormat(startOfMonth(d))).toBe('2026-05-01');
    expect(isoFormat(endOfMonth(d))).toBe('2026-05-31');
  });
});

describe('startOfWeekMon', () => {
  it('snaps to Monday', () => {
    // Tue 2026-05-12 → Mon 2026-05-11
    expect(isoFormat(startOfWeekMon(new Date(2026, 4, 12)))).toBe('2026-05-11');
    // Sun 2026-05-17 → Mon 2026-05-11
    expect(isoFormat(startOfWeekMon(new Date(2026, 4, 17)))).toBe('2026-05-11');
  });

  it('endOfWeekSun snaps to Sunday', () => {
    expect(isoFormat(endOfWeekSun(new Date(2026, 4, 12)))).toBe('2026-05-17');
  });

  it('sameDay returns false for null/undefined inputs', () => {
    expect(sameDay(null, new Date())).toBe(false);
    expect(sameDay(new Date(), undefined)).toBe(false);
    expect(sameDay(null, null)).toBe(false);
  });
});

describe('isoWeek', () => {
  it('computes ISO week numbers', () => {
    expect(isoWeek(new Date(2026, 4, 12))).toBe(20);
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);
    expect(isoWeek(new Date(2026, 11, 31))).toBe(53);
  });
});

describe('weeksInYear', () => {
  it('returns 52 or 53 per the ISO rule', () => {
    expect(weeksInYear(2026)).toBe(53);
    expect(weeksInYear(2027)).toBe(52);
    expect(weeksInYear(2020)).toBe(53);
  });
});

describe('isLeapYear', () => {
  it('handles 4/100/400 rule', () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('weekStartOfYear', () => {
  it('returns the Monday starting ISO week N', () => {
    expect(isoFormat(weekStartOfYear(2026, 1))).toBe('2025-12-29');
    expect(isoFormat(weekStartOfYear(2026, 20))).toBe('2026-05-11');
  });
});

describe('easterDate', () => {
  it('matches known Easters', () => {
    expect(isoFormat(easterDate(2024))).toBe('2024-03-31');
    expect(isoFormat(easterDate(2025))).toBe('2025-04-20');
    expect(isoFormat(easterDate(2027))).toBe('2027-03-28');
  });
});

describe('nthWeekdayInMonth', () => {
  it('finds the Nth weekday', () => {
    // 4th Thursday of November 2026 = Nov 26 (Thanksgiving)
    expect(isoFormat(nthWeekdayInMonth(2026, 10, 4, 4)!)).toBe('2026-11-26');
    // Last Friday of October 2027 = Oct 29
    expect(isoFormat(nthWeekdayInMonth(2027, 9, 5, -1)!)).toBe('2027-10-29');
  });

  it('returns null when nth overflows the month', () => {
    // No "5th Monday" of a 4-week month
    expect(nthWeekdayInMonth(2026, 1, 1, 5)).toBeNull();
  });
});

describe('ordinalSuffix', () => {
  it('renders English ordinals', () => {
    expect(ordinalSuffix(1)).toBe('1st');
    expect(ordinalSuffix(2)).toBe('2nd');
    expect(ordinalSuffix(3)).toBe('3rd');
    expect(ordinalSuffix(11)).toBe('11th');
    expect(ordinalSuffix(21)).toBe('21st');
    expect(ordinalSuffix(112)).toBe('112th');
  });
});

describe('sameDay / diffDays', () => {
  it('compares by year/month/day only', () => {
    const a = new Date(2026, 4, 12, 1);
    const b = new Date(2026, 4, 12, 23);
    expect(sameDay(a, b)).toBe(true);
    expect(diffDays(a, b)).toBe(0);
  });
  it('handles negatives', () => {
    expect(diffDays(new Date(2026, 4, 12), new Date(2026, 4, 22))).toBe(10);
    expect(diffDays(new Date(2026, 4, 22), new Date(2026, 4, 12))).toBe(-10);
  });
});
