/**
 * Pure date math. No locale, no DOM, no globals — every function takes the
 * dates it needs and returns a new `Date`. `Date` objects are never mutated.
 */

export const MS_PER_DAY = 86_400_000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  const day = x.getDate();
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(day, last));
  return x;
}

export function addYears(d: Date, n: number): Date {
  return addMonths(d, n * 12);
}

export function addBusinessDays(d: Date, n: number): Date {
  let x = new Date(d);
  const dir = n >= 0 ? 1 : -1;
  let remaining = Math.abs(n);
  while (remaining > 0) {
    x = addDays(x, dir);
    const dow = x.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return x;
}

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function startOfWeekMon(d: Date): Date {
  const dow = d.getDay();
  const off = (dow + 6) % 7;
  return addDays(d, -off);
}

export function endOfWeekSun(d: Date): Date {
  return addDays(startOfWeekMon(d), 6);
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

/** "12" → "12th", "1" → "1st", "23" → "23rd", "42" → "42nd". */
export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** ISO 8601 week number — week 1 is the one containing Jan 4. */
export function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dow = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dow + 3); // shift to Thursday of this week
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((t.getTime() - yearStart.getTime()) / MS_PER_DAY - 3 + ((yearStart.getUTCDay() + 6) % 7)) /
        7,
    )
  );
}

export function weekStartOfYear(year: number, n: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dow = (jan4.getDay() + 6) % 7;
  const week1Mon = addDays(jan4, -dow);
  return addDays(week1Mon, (n - 1) * 7);
}

export function weeksInYear(year: number): 52 | 53 {
  const jan1Dow = new Date(year, 0, 1).getDay();
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (jan1Dow === 4 || (leap && jan1Dow === 3)) return 53;
  return 52;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Anonymous Gregorian algorithm — returns Easter Sunday for a given year. */
export function easterDate(y: number): Date {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const mo = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * mo + 114) / 31);
  const day = ((h + l - 7 * mo + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

export function nthWeekdayInMonth(
  year: number,
  month: number,
  wd: number,
  nth: number,
): Date | null {
  if (nth < 0) {
    const last = new Date(year, month + 1, 0);
    const off = (last.getDay() - wd + 7) % 7;
    return addDays(last, -off);
  }
  const first = new Date(year, month, 1);
  const off = (wd - first.getDay() + 7) % 7;
  const day = 1 + off + (nth - 1) * 7;
  const d = new Date(year, month, day);
  if (d.getMonth() !== month) return null;
  return d;
}

export function isoFormat(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yr = String(d.getFullYear()).padStart(4, '0');
  return `${yr}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
