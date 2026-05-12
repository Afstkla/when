/**
 * English vocabulary. Every word and multi-word phrase recognised by the
 * parser in English lives in this file — adding a new alias is a one-line
 * change.
 */

import type {
  Bound,
  Direction,
  HolidayDefinition,
  MonthIndex,
  TimeUnit,
  WeekdayIndex,
  ZodiacDefinition,
} from '../types.js';
import type { TokenSpec, Vocabulary } from './Vocabulary.js';

const THIS_DIR: Direction = { sign: 0, kind: 'this' };
const NEXT_DIR: Direction = { sign: 1, kind: 'next' };
const LAST_DIR: Direction = { sign: -1, kind: 'last' };

const DIRECTIONS: Record<string, Direction> = {
  this: THIS_DIR,
  current: THIS_DIR,
  all: THIS_DIR,
  whole: THIS_DIR,
  entire: THIS_DIR,
  next: NEXT_DIR,
  nxt: NEXT_DIR,
  coming: NEXT_DIR,
  upcoming: NEXT_DIR,
  last: LAST_DIR,
  past: LAST_DIR,
  previous: LAST_DIR,
  former: LAST_DIR,
};

const UNITS: Record<string, TimeUnit> = {
  d: 'day',
  day: 'day',
  days: 'day',
  w: 'week',
  wk: 'week',
  wks: 'week',
  week: 'week',
  weeks: 'week',
  mo: 'month',
  mos: 'month',
  month: 'month',
  months: 'month',
  q: 'quarter',
  qtr: 'quarter',
  qtrs: 'quarter',
  quarter: 'quarter',
  quarters: 'quarter',
  h: 'half',
  half: 'half',
  halves: 'half',
  y: 'year',
  yr: 'year',
  yrs: 'year',
  year: 'year',
  years: 'year',
  decade: 'decade',
  decades: 'decade',
  decennium: 'decade',
  decennia: 'decade',
  century: 'century',
  centuries: 'century',
  millennium: 'millennium',
  millennia: 'millennium',
  millenium: 'millennium',
  milleniums: 'millennium',
  millenniums: 'millennium',
  // Business / weekday-only counting — all variants map to the same canonical unit
  b: 'businessDay',
  bd: 'businessDay',
  weekday: 'businessDay',
  weekdays: 'businessDay',
  'business day': 'businessDay',
  'business days': 'businessDay',
  'working day': 'businessDay',
  'working days': 'businessDay',
};

const WEEKDAYS: Record<string, WeekdayIndex> = {
  sun: 0,
  sunday: 0,
  sundays: 0,
  mon: 1,
  monday: 1,
  mondays: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  tuesdays: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  wednesdays: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  thursdays: 4,
  fri: 5,
  friday: 5,
  fridays: 5,
  sat: 6,
  saturday: 6,
  saturdays: 6,
};

const MONTHS: Record<string, MonthIndex> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const ORDINALS: Record<string, number> = {
  first: 1,
  '1st': 1,
  one: 1,
  second: 2,
  '2nd': 2,
  two: 2,
  third: 3,
  '3rd': 3,
  three: 3,
  fourth: 4,
  '4th': 4,
  four: 4,
  fifth: 5,
  '5th': 5,
  five: 5,
  sixth: 6,
  '6th': 6,
  seventh: 7,
  '7th': 7,
  eighth: 8,
  '8th': 8,
  ninth: 9,
  '9th': 9,
  tenth: 10,
  '10th': 10,
  last: -1,
  final: -1,
};

const HOLIDAYS: Record<string, HolidayDefinition> = {
  christmas: { type: 'fixed', month: 11, day: 25 },
  xmas: { type: 'fixed', month: 11, day: 25 },
  'christmas day': { type: 'fixed', month: 11, day: 25 },
  'christmas eve': { type: 'fixed', month: 11, day: 24 },
  'xmas eve': { type: 'fixed', month: 11, day: 24 },
  'new year': { type: 'fixed', month: 0, day: 1 },
  'new years': { type: 'fixed', month: 0, day: 1 },
  "new year's": { type: 'fixed', month: 0, day: 1 },
  "new year's day": { type: 'fixed', month: 0, day: 1 },
  'new years day': { type: 'fixed', month: 0, day: 1 },
  nye: { type: 'fixed', month: 11, day: 31 },
  "new year's eve": { type: 'fixed', month: 11, day: 31 },
  'new years eve': { type: 'fixed', month: 11, day: 31 },
  halloween: { type: 'fixed', month: 9, day: 31 },
  "hallowe'en": { type: 'fixed', month: 9, day: 31 },
  valentines: { type: 'fixed', month: 1, day: 14 },
  "valentine's": { type: 'fixed', month: 1, day: 14 },
  "valentine's day": { type: 'fixed', month: 1, day: 14 },
  'valentines day': { type: 'fixed', month: 1, day: 14 },
  'april fools': { type: 'fixed', month: 3, day: 1 },
  "april fool's": { type: 'fixed', month: 3, day: 1 },
  "april fools' day": { type: 'fixed', month: 3, day: 1 },
  'independence day': { type: 'fixed', month: 6, day: 4 },
  'july 4th': { type: 'fixed', month: 6, day: 4 },
  'fourth of july': { type: 'fixed', month: 6, day: 4 },
  '4th of july': { type: 'fixed', month: 6, day: 4 },
  juneteenth: { type: 'fixed', month: 5, day: 19 },
  'veterans day': { type: 'fixed', month: 10, day: 11 },
  "veteran's day": { type: 'fixed', month: 10, day: 11 },
  'pi day': { type: 'fixed', month: 2, day: 14 },
  thanksgiving: { type: 'nth', month: 10, weekday: 4, nth: 4 },
  'thanksgiving day': { type: 'nth', month: 10, weekday: 4, nth: 4 },
  "mother's day": { type: 'nth', month: 4, weekday: 0, nth: 2 },
  'mothers day': { type: 'nth', month: 4, weekday: 0, nth: 2 },
  "father's day": { type: 'nth', month: 5, weekday: 0, nth: 3 },
  'fathers day': { type: 'nth', month: 5, weekday: 0, nth: 3 },
  'labor day': { type: 'nth', month: 8, weekday: 1, nth: 1 },
  'labour day': { type: 'nth', month: 8, weekday: 1, nth: 1 },
  'memorial day': { type: 'nth', month: 4, weekday: 1, nth: -1 },
  'mlk day': { type: 'nth', month: 0, weekday: 1, nth: 3 },
  'martin luther king day': { type: 'nth', month: 0, weekday: 1, nth: 3 },
  'presidents day': { type: 'nth', month: 1, weekday: 1, nth: 3 },
  "president's day": { type: 'nth', month: 1, weekday: 1, nth: 3 },
  'columbus day': { type: 'nth', month: 9, weekday: 1, nth: 2 },
  'indigenous peoples day': { type: 'nth', month: 9, weekday: 1, nth: 2 },
  "indigenous peoples' day": { type: 'nth', month: 9, weekday: 1, nth: 2 },
  easter: { type: 'easter', offset: 0 },
  'easter sunday': { type: 'easter', offset: 0 },
  'good friday': { type: 'easter', offset: -2 },
  solstice: { type: 'solstice' },
  'winter solstice': { type: 'fixed', month: 11, day: 21 },
  'summer solstice': { type: 'fixed', month: 5, day: 21 },
  'vernal equinox': { type: 'fixed', month: 2, day: 20 },
  'spring equinox': { type: 'fixed', month: 2, day: 20 },
  'autumnal equinox': { type: 'fixed', month: 8, day: 22 },
  'autumn equinox': { type: 'fixed', month: 8, day: 22 },
  'fall equinox': { type: 'fixed', month: 8, day: 22 },
  equinox: { type: 'equinox' },
};

const ZODIACS: Record<string, ZodiacDefinition> = {
  aries: { startM: 2, startD: 21, endM: 3, endD: 19 },
  taurus: { startM: 3, startD: 20, endM: 4, endD: 20 },
  gemini: { startM: 4, startD: 21, endM: 5, endD: 20 },
  cancer: { startM: 5, startD: 21, endM: 6, endD: 22 },
  leo: { startM: 6, startD: 23, endM: 7, endD: 22 },
  virgo: { startM: 7, startD: 23, endM: 8, endD: 22 },
  libra: { startM: 8, startD: 23, endM: 9, endD: 22 },
  scorpio: { startM: 9, startD: 23, endM: 10, endD: 21 },
  sagittarius: { startM: 10, startD: 22, endM: 11, endD: 21 },
  capricorn: { startM: 11, startD: 22, endM: 0, endD: 19, wraps: true },
  aquarius: { startM: 0, startD: 20, endM: 1, endD: 18 },
  pisces: { startM: 1, startD: 19, endM: 2, endD: 20 },
};

const LITERALS: Record<string, number> = {
  today: 0,
  tdy: 0,
  now: 0,
  tomorrow: 1,
  tmrw: 1,
  tmr: 1,
  tmro: 1,
  tmw: 1,
  yesterday: -1,
  yday: -1,
  ytd: -1,
  'the day after tomorrow': 2,
  'day after tomorrow': 2,
  'the day before yesterday': -2,
  'day before yesterday': -2,
};

const BOUNDS: Record<string, Bound> = {
  start: 'start',
  beginning: 'start',
  end: 'end',
  mid: 'mid',
  middle: 'mid',
  early: 'early',
  late: 'late',
};

const BOUND_UNITS: Record<string, { bound: Bound; unit: TimeUnit }> = {
  eom: { bound: 'end', unit: 'month' },
  bom: { bound: 'start', unit: 'month' },
  eoy: { bound: 'end', unit: 'year' },
  boy: { bound: 'start', unit: 'year' },
  eow: { bound: 'end', unit: 'week' },
  bow: { bound: 'start', unit: 'week' },
};

const RELPREPS: Record<string, 'ago' | 'before' | 'after' | 'hence' | 'later' | 'ahead'> = {
  ago: 'ago',
  before: 'before',
  after: 'after',
  hence: 'hence',
  later: 'later',
  ahead: 'ahead',
};

const CONNECTIVES = ['to', 'through', 'thru', 'until', 'til', 'till', '..', '...', '->', '→'];

const WEEKEND = ['weekend'];

function buildPhrases(): Map<string, TokenSpec> {
  const map = new Map<string, TokenSpec>();
  const set = (k: string, v: TokenSpec): void => {
    map.set(k.toLowerCase(), v);
  };

  // Map semantics: the last value set for a key wins. Lower-priority groups
  // therefore go FIRST. The only real conflict in this vocabulary is `last`,
  // which is both a DIR (`last week`) and an ORDINAL (`last fri of march`);
  // the parser handles the ordinal usage through `isOrdinalLike`, so DIR must
  // be the resolved spec at the token layer.
  for (const [w, def] of Object.entries(HOLIDAYS)) set(w, { type: 'HOLIDAY', value: w, def });
  for (const [w, def] of Object.entries(ZODIACS)) set(w, { type: 'ZODIAC', value: w, def });
  for (const [w, n] of Object.entries(ORDINALS)) set(w, { type: 'ORD', value: n });
  for (const [w, m] of Object.entries(MONTHS)) set(w, { type: 'MONTH', value: m });
  for (const [w, wd] of Object.entries(WEEKDAYS)) set(w, { type: 'WEEKDAY', value: wd });
  for (const [w, u] of Object.entries(UNITS)) set(w, { type: 'UNIT', value: u });
  for (const [w, dir] of Object.entries(DIRECTIONS)) set(w, { type: 'DIR', value: dir });
  for (const [w, n] of Object.entries(LITERALS)) set(w, { type: 'LIT', value: n });
  for (const [w, b] of Object.entries(BOUNDS)) set(w, { type: 'BOUND', value: b });
  for (const [w, bu] of Object.entries(BOUND_UNITS))
    set(w, { type: 'BOUND_UNIT', bound: bu.bound, unit: bu.unit });
  for (const [w, r] of Object.entries(RELPREPS)) set(w, { type: 'RELPREP', value: r });
  for (const c of CONNECTIVES) set(c, { type: 'CONN' });
  for (const w of WEEKEND) set(w, { type: 'WEEKEND' });

  // Structural tokens (single words, function-word semantics)
  set('from', { type: 'FROM' });
  set('between', { type: 'BETWEEN' });
  set('and', { type: 'AND' });
  set('of', { type: 'OF' });
  set('in', { type: 'IN' });
  set('plus', { type: 'OP', value: 1 });
  set('minus', { type: 'OP', value: -1 });

  return map;
}

export const English: Vocabulary = {
  id: 'en',
  dateFormat: 'us',
  ordinalSuffix: /^(\d+)(st|nd|rd|th)$/,
  articles: new Set(['the']),
  phrases: buildPhrases(),
};
