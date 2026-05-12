/**
 * Dutch vocabulary. Mirrors the English shape — every alias and idiom is in
 * the phrase map or the locale-specific rewrite list. To add a new locale,
 * copy this file and translate.
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
  deze: THIS_DIR,
  dit: THIS_DIR,
  huidig: THIS_DIR,
  huidige: THIS_DIR,
  hele: THIS_DIR,
  gehele: THIS_DIR,
  alle: THIS_DIR,
  volgend: NEXT_DIR,
  volgende: NEXT_DIR,
  komend: NEXT_DIR,
  komende: NEXT_DIR,
  aanstaande: NEXT_DIR,
  aankomende: NEXT_DIR,
  vorig: LAST_DIR,
  vorige: LAST_DIR,
  voorgaand: LAST_DIR,
  voorgaande: LAST_DIR,
  afgelopen: LAST_DIR,
};

const UNITS: Record<string, TimeUnit> = {
  d: 'day',
  dag: 'day',
  dagen: 'day',
  w: 'week',
  wk: 'week',
  week: 'week',
  weken: 'week',
  mnd: 'month',
  mnden: 'month',
  maand: 'month',
  maanden: 'month',
  kw: 'quarter',
  kwartaal: 'quarter',
  kwartalen: 'quarter',
  h: 'half',
  halfjaar: 'half',
  halfjaren: 'half',
  jr: 'year',
  jaar: 'year',
  jaren: 'year',
  decennium: 'decade',
  decennia: 'decade',
  eeuw: 'century',
  eeuwen: 'century',
  millennium: 'millennium',
  millennia: 'millennium',
  // Business / weekday-only counting
  werkdag: 'businessDay',
  werkdagen: 'businessDay',
  weekdag: 'businessDay',
  weekdagen: 'businessDay',
  doordeweekse: 'businessDay',
};

const WEEKDAYS: Record<string, WeekdayIndex> = {
  zo: 0,
  zon: 0,
  zondag: 0,
  zondagen: 0,
  ma: 1,
  maan: 1,
  maandag: 1,
  maandagen: 1,
  di: 2,
  dins: 2,
  dinsdag: 2,
  dinsdagen: 2,
  wo: 3,
  woen: 3,
  woensdag: 3,
  woensdagen: 3,
  do: 4,
  don: 4,
  donderdag: 4,
  donderdagen: 4,
  vr: 5,
  vrij: 5,
  vrijdag: 5,
  vrijdagen: 5,
  za: 6,
  zat: 6,
  zaterdag: 6,
  zaterdagen: 6,
};

const MONTHS: Record<string, MonthIndex> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mrt: 2,
  maart: 2,
  apr: 3,
  april: 3,
  mei: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augustus: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const ORDINALS: Record<string, number> = {
  eerste: 1,
  '1e': 1,
  '1ste': 1,
  een: 1,
  tweede: 2,
  '2e': 2,
  '2de': 2,
  twee: 2,
  derde: 3,
  '3e': 3,
  '3de': 3,
  drie: 3,
  vierde: 4,
  '4e': 4,
  '4de': 4,
  vier: 4,
  vijfde: 5,
  '5e': 5,
  '5de': 5,
  vijf: 5,
  zesde: 6,
  '6e': 6,
  '6de': 6,
  zevende: 7,
  '7e': 7,
  '7de': 7,
  achtste: 8,
  '8e': 8,
  '8ste': 8,
  negende: 9,
  '9e': 9,
  '9de': 9,
  tiende: 10,
  '10e': 10,
  '10de': 10,
  laatste: -1,
  allerlaatste: -1,
};

const HOLIDAYS: Record<string, HolidayDefinition> = {
  kerst: { type: 'fixed', month: 11, day: 25 },
  kerstmis: { type: 'fixed', month: 11, day: 25 },
  kerstdag: { type: 'fixed', month: 11, day: 25 },
  'eerste kerstdag': { type: 'fixed', month: 11, day: 25 },
  'tweede kerstdag': { type: 'fixed', month: 11, day: 26 },
  kerstavond: { type: 'fixed', month: 11, day: 24 },
  nieuwjaar: { type: 'fixed', month: 0, day: 1 },
  nieuwjaarsdag: { type: 'fixed', month: 0, day: 1 },
  oudejaarsavond: { type: 'fixed', month: 11, day: 31 },
  oudjaar: { type: 'fixed', month: 11, day: 31 },
  'oud en nieuw': { type: 'fixed', month: 11, day: 31 },
  halloween: { type: 'fixed', month: 9, day: 31 },
  valentijnsdag: { type: 'fixed', month: 1, day: 14 },
  valentijn: { type: 'fixed', month: 1, day: 14 },
  sinterklaas: { type: 'fixed', month: 11, day: 5 },
  pakjesavond: { type: 'fixed', month: 11, day: 5 },
  sinterklaasavond: { type: 'fixed', month: 11, day: 5 },
  koningsdag: { type: 'fixed', month: 3, day: 27 },
  koninginnedag: { type: 'fixed', month: 3, day: 30 },
  bevrijdingsdag: { type: 'fixed', month: 4, day: 5 },
  dodenherdenking: { type: 'fixed', month: 4, day: 4 },
  // Sunday-based "Father's"/"Mother's" — same months as English (NL uses same dates)
  moederdag: { type: 'nth', month: 4, weekday: 0, nth: 2 },
  vaderdag: { type: 'nth', month: 5, weekday: 0, nth: 3 },
  // Easter and its relatives
  pasen: { type: 'easter', offset: 0 },
  paasdag: { type: 'easter', offset: 0 },
  paaszondag: { type: 'easter', offset: 0 },
  'eerste paasdag': { type: 'easter', offset: 0 },
  'tweede paasdag': { type: 'easter', offset: 1 },
  paasmaandag: { type: 'easter', offset: 1 },
  'goede vrijdag': { type: 'easter', offset: -2 },
  'witte donderdag': { type: 'easter', offset: -3 },
  hemelvaartsdag: { type: 'easter', offset: 39 },
  hemelvaart: { type: 'easter', offset: 39 },
  pinksteren: { type: 'easter', offset: 49 },
  pinksterzondag: { type: 'easter', offset: 49 },
  'eerste pinksterdag': { type: 'easter', offset: 49 },
  'tweede pinksterdag': { type: 'easter', offset: 50 },
  pinkstermaandag: { type: 'easter', offset: 50 },
  // Astronomy
  zomerzonnewende: { type: 'fixed', month: 5, day: 21 },
  winterzonnewende: { type: 'fixed', month: 11, day: 21 },
  zonnewende: { type: 'solstice' },
  lente: { type: 'fixed', month: 2, day: 20 },
  lentebegin: { type: 'fixed', month: 2, day: 20 },
  herfst: { type: 'fixed', month: 8, day: 22 },
  herfstbegin: { type: 'fixed', month: 8, day: 22 },
  equinox: { type: 'equinox' },
};

const ZODIACS: Record<string, ZodiacDefinition> = {
  ram: { startM: 2, startD: 21, endM: 3, endD: 19 },
  stier: { startM: 3, startD: 20, endM: 4, endD: 20 },
  tweelingen: { startM: 4, startD: 21, endM: 5, endD: 20 },
  kreeft: { startM: 5, startD: 21, endM: 6, endD: 22 },
  leeuw: { startM: 6, startD: 23, endM: 7, endD: 22 },
  maagd: { startM: 7, startD: 23, endM: 8, endD: 22 },
  weegschaal: { startM: 8, startD: 23, endM: 9, endD: 22 },
  schorpioen: { startM: 9, startD: 23, endM: 10, endD: 21 },
  boogschutter: { startM: 10, startD: 22, endM: 11, endD: 21 },
  steenbok: { startM: 11, startD: 22, endM: 0, endD: 19, wraps: true },
  waterman: { startM: 0, startD: 20, endM: 1, endD: 18 },
  vissen: { startM: 1, startD: 19, endM: 2, endD: 20 },
};

const LITERALS: Record<string, number> = {
  vandaag: 0,
  vdg: 0,
  nu: 0,
  morgen: 1,
  mrg: 1,
  gisteren: -1,
  gst: -1,
  overmorgen: 2,
  eergisteren: -2,
};

const BOUNDS: Record<string, Bound> = {
  begin: 'start',
  start: 'start',
  eind: 'end',
  einde: 'end',
  midden: 'mid',
  half: 'mid',
  vroeg: 'early',
  laat: 'late',
};

const BOUND_UNITS: Record<string, { bound: Bound; unit: TimeUnit }> = {
  eom: { bound: 'end', unit: 'month' },
  bom: { bound: 'start', unit: 'month' },
  eoy: { bound: 'end', unit: 'year' },
  boy: { bound: 'start', unit: 'year' },
};

const RELPREPS: Record<string, 'ago' | 'before' | 'after' | 'hence' | 'later' | 'ahead'> = {
  geleden: 'ago',
  voor: 'before',
  voorafgaand: 'before',
  na: 'after',
  later: 'later',
};

const CONNECTIVES = ['tot', 't/m', 'totdat'];
const WEEKEND = ['weekend'];

function buildPhrases(): Map<string, TokenSpec> {
  const map = new Map<string, TokenSpec>();
  const set = (k: string, v: TokenSpec): void => {
    map.set(k.toLowerCase(), v);
  };

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

  // Structural tokens
  set('vanaf', { type: 'FROM' });
  set('tussen', { type: 'BETWEEN' });
  set('en', { type: 'AND' });
  // "van" is ambiguous — usually OF in Dutch. Use "vanaf" for FROM.
  set('van', { type: 'OF' });
  // "over X dagen" = "in X days" — `over` plays the role of English `in`.
  set('over', { type: 'IN' });
  set('in', { type: 'IN' });
  set('plus', { type: 'OP', value: 1 });
  set('min', { type: 'OP', value: -1 });
  set('minus', { type: 'OP', value: -1 });

  return map;
}

const REWRITES: ReadonlyArray<readonly [RegExp, string]> = [
  // "vanaf nu" / "vanaf vandaag" → suffix forward marker
  [/\bvanaf\s+(nu|vandaag)\b(?!\s+(?:tot|totdat|t\/m))/g, '__forward__'],
];

export const Dutch: Vocabulary = {
  id: 'nl',
  dateFormat: 'eu',
  // "1e", "2de", etc.
  ordinalSuffix: /^(\d+)(e|de|ste)$/,
  articles: new Set(['de', 'het', 'een']),
  rewrites: REWRITES,
  phrases: buildPhrases(),
};
