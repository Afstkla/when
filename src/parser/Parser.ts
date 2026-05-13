/**
 * Recursive-descent parser. Takes a flat token list from {@link Tokenizer} and
 * returns an {@link AstNode}, or `null` for unrecognised input.
 *
 * The grammar (informal):
 *
 *     expr     = range | term
 *     range    = 'from' term (CONN | DASH) term
 *              | 'between' term 'and' term
 *              | term (CONN | DASH) term            -- with month-day fallback
 *     term     = anchor (OP|DASH) NUMBER UNIT?      -- postfix shift
 *              | NUMBER UNIT RELPREP anchor         -- "N units before X"
 *              | 'in' NUMBER UNIT FROMNOW?
 *              | NUMBER UNIT FROMNOW
 *              | NUMBER WEEKDAY (FROMNOW | RELPREP) -- "2 mondays from now"
 *              | atom
 *     atom     = various length-1..N token patterns (see {@link parseAtom})
 */

import {
  type AstNode,
  BoundOf,
  BoundOfMonth,
  CenturyRange,
  DateLit,
  DecadeRange,
  HalfRange,
  Holiday,
  Literal,
  MillenniumRange,
  MonthDay,
  MonthRange,
  NthIn,
  NthWeekday,
  NthWeekdayFromNow,
  Period,
  QuarterRange,
  Range,
  Shift,
  Weekday,
  WeekendRange,
  Window,
  YearRange,
  ZodiacRange,
} from '../ast/index.js';
import { makeDate } from '../dates.js';
import type { Token, TokenType } from '../tokenizer/Token.js';
import { Tokenizer, type TokenizerOptions } from '../tokenizer/Tokenizer.js';
import type { TimeUnit, WeekdayIndex } from '../types.js';
import { English } from '../vocabulary/en.js';
import type { Vocabulary } from '../vocabulary/Vocabulary.js';

export interface ParserOptions {
  /** Vocabulary / locale. Defaults to English. */
  readonly vocabulary?: Vocabulary;
}

/**
 * Predicate: is this token usable as an ordinal? Includes the literal `last`
 * which tokenises as a DIR but is contextually an ordinal in `last fri of X`.
 */
function isOrdinalLike(t: Token): boolean {
  if (t.spec.type === 'ORD') return true;
  return t.spec.type === 'DIR' && t.spec.value.kind === 'last';
}

function ordValue(t: Token): number {
  if (t.spec.type === 'ORD') return t.spec.value;
  return -1; // last
}

function validDay(year: number, month: number, day: number): boolean {
  if (day < 1 || day > 31) return false;
  const last = makeDate(year, month + 1, 0).getDate();
  return day <= last;
}

function ty(t: Token | undefined, type: TokenType): boolean {
  return !!t && t.spec.type === type;
}

export class Parser {
  private readonly tokenizer: Tokenizer;

  constructor(public readonly vocabulary: Vocabulary = English) {
    this.tokenizer = new Tokenizer(vocabulary);
  }

  parse(input: string, options: TokenizerOptions = {}): AstNode | null {
    if (!input?.trim()) return null;
    const tokens = this.tokenizer.tokenize(input, options);
    if (!tokens.length) return null;
    return this.parseExpr(tokens, options.today);
  }

  /** Try range first; fall back to term. */
  private parseExpr(toks: Token[], today?: Date): AstNode | null {
    return this.parseRange(toks, today) ?? this.parseTerm(toks, today);
  }

  private parseRange(toks: Token[], today?: Date): AstNode | null {
    // "from X to Y" / "from X - Y"
    if (ty(toks[0], 'FROM')) {
      for (let i = 1; i < toks.length - 1; i++) {
        if (ty(toks[i], 'CONN') || ty(toks[i], 'DASH')) {
          const a = this.parseTerm(toks.slice(1, i), today);
          const b = this.parseTerm(toks.slice(i + 1), today);
          if (a && b) return new Range(a, b);
        }
      }
    }
    // "between X and Y"
    if (ty(toks[0], 'BETWEEN')) {
      for (let i = 1; i < toks.length - 1; i++) {
        if (ty(toks[i], 'AND')) {
          const a = this.parseTerm(toks.slice(1, i), today);
          const b = this.parseTerm(toks.slice(i + 1), today);
          if (a && b) return new Range(a, b);
        }
      }
    }
    // "X to Y" / "X dash Y"
    for (let i = 1; i < toks.length - 1; i++) {
      if (!ty(toks[i], 'CONN') && !ty(toks[i], 'DASH')) continue;
      const a = this.parseTerm(toks.slice(0, i), today);
      if (!a) continue;
      const right = toks.slice(i + 1);
      let b = this.parseTerm(right, today);
      // Bare number on the right inherits month/year from the left side
      // (lets "may 12 - 19" parse as a range, not as a subtraction).
      if (!b && right.length === 1) {
        const r0 = right[0];
        if (r0 && r0.spec.type === 'NUMBER' && a instanceof MonthDay) {
          b = new MonthDay(a.month, r0.spec.value, a.year);
        }
      }
      if (a && b) return new Range(a, b);
    }
    return null;
  }

  private parseTerm(toks: Token[], today?: Date): AstNode | null {
    if (!toks.length) return null;

    // Postfix shift: <anchor> (OP|DASH) NUMBER UNIT?  — rightmost op so chains compose
    for (let i = toks.length - 1; i >= 1; i--) {
      const t = toks[i];
      if (!t) continue;
      if (t.spec.type !== 'OP' && t.spec.type !== 'DASH') continue;
      const after = toks.slice(i + 1);
      const first = after[0];
      if (!first || first.spec.type !== 'NUMBER') continue;
      const n = first.spec.value;
      let unit: TimeUnit = 'day';
      let consumed = 1;
      const second = after[1];
      if (second && second.spec.type === 'UNIT') {
        unit = second.spec.value;
        consumed = 2;
      }
      if (consumed !== after.length) continue;
      const sign: 1 | -1 = t.spec.type === 'OP' ? (t.spec.value as 1 | -1) : -1;
      const anchor = this.parseTerm(toks.slice(0, i), today);
      if (!anchor) continue;
      return new Shift(anchor, sign, n, unit);
    }

    // "N unit (before|after|ago|hence|later|ahead) anchor"
    for (let i = 1; i < toks.length; i++) {
      const tok = toks[i];
      const t0 = toks[0];
      const t1 = toks[1];
      if (!tok || !t0 || !t1) continue;
      if (tok.spec.type !== 'RELPREP') continue;
      if (t0.spec.type !== 'NUMBER' || t1.spec.type !== 'UNIT') continue;
      const n = t0.spec.value;
      const unit = t1.spec.value;
      const word = tok.spec.value;
      const sign: 1 | -1 = word === 'ago' || word === 'before' ? -1 : 1;
      if (word === 'ago' || word === 'hence' || word === 'later' || word === 'ahead') {
        if (i === 2 && i === toks.length - 1) {
          return new Shift(new Literal(0), sign, n, unit);
        }
        continue;
      }
      if (i === 2) {
        const anchor = this.parseTerm(toks.slice(3), today);
        if (anchor) return new Shift(anchor, sign, n, unit);
      }
    }

    // "in N unit" or "in N unit from now"
    const t0 = toks[0];
    const t1 = toks[1];
    const t2 = toks[2];
    if (
      toks.length >= 3 &&
      ty(t0, 'IN') &&
      t1?.spec.type === 'NUMBER' &&
      t2?.spec.type === 'UNIT'
    ) {
      if (toks.length === 3 || (toks.length === 4 && ty(toks[3], 'FROMNOW'))) {
        return new Shift(new Literal(0), 1, t1.spec.value, t2.spec.value);
      }
    }

    // "N unit from now"
    if (
      toks.length === 3 &&
      t0?.spec.type === 'NUMBER' &&
      t1?.spec.type === 'UNIT' &&
      ty(t2, 'FROMNOW')
    ) {
      return new Shift(new Literal(0), 1, t0.spec.value, t1.spec.value);
    }

    // "N weekdays from now/ago"
    if (toks.length === 3 && t0?.spec.type === 'NUMBER' && t1?.spec.type === 'WEEKDAY') {
      if (ty(t2, 'FROMNOW')) {
        return new NthWeekdayFromNow(t0.spec.value, t1.spec.value as WeekdayIndex, 1);
      }
      if (t2?.spec.type === 'RELPREP' && t2.spec.value === 'ago') {
        return new NthWeekdayFromNow(t0.spec.value, t1.spec.value as WeekdayIndex, -1);
      }
    }

    return this.parseAtom(toks, today);
  }

  private parseAtom(toks: Token[], today?: Date): AstNode | null {
    if (!toks.length) return null;
    const t0 = toks[0];
    if (!t0) return null;

    const todayYear = (today ?? new Date()).getFullYear();

    if (toks.length === 1) return this.parseAtom1(t0, todayYear);
    if (toks.length === 2) {
      const t1 = toks[1];
      if (!t1) return null;
      return this.parseAtom2(t0, t1, todayYear, today);
    }
    if (toks.length === 3) {
      const t1 = toks[1];
      const t2 = toks[2];
      if (!t1 || !t2) return null;
      return this.parseAtom3(t0, t1, t2, todayYear);
    }
    if (toks.length === 4) {
      const a = this.parseAtom4(toks, today);
      if (a) return a;
    }
    return this.parseAtomLong(toks, today);
  }

  private parseAtom1(t: Token, todayYear: number): AstNode | null {
    switch (t.spec.type) {
      case 'LIT':
        return new Literal(t.spec.value);
      case 'DATE':
        return new DateLit(t.spec.value);
      case 'HOLIDAY':
        return new Holiday(t.spec.value, t.spec.def, null);
      case 'ZODIAC':
        return new ZodiacRange(t.spec.value, t.spec.def, null);
      case 'WEEKDAY':
        return new Weekday('next-or-today', t.spec.value);
      case 'WEEKEND':
        return new WeekendRange('this');
      case 'YEAR':
        return new YearRange(t.spec.value);
      case 'MONTH':
        return new MonthRange(t.spec.value, todayYear);
      case 'QUARTER':
        return new QuarterRange(t.spec.value, todayYear);
      case 'HALF':
        return new HalfRange(t.spec.value, todayYear);
      case 'DECADE':
        return new DecadeRange(t.spec.value);
      case 'BOUND_UNIT':
        return new BoundOf(t.spec.bound, new Period('this', t.spec.unit));
      default:
        return null;
    }
  }

  private parseAtom2(a: Token, b: Token, todayYear: number, today?: Date): AstNode | null {
    // Standalone signed offset: "+45", "-7"  →  today ± n days
    if (a.spec.type === 'OP' && b.spec.type === 'NUMBER') {
      return new Shift(new Literal(0), a.spec.value as 1 | -1, b.spec.value, 'day');
    }
    // "week 20", "month 3"  →  Nth slot of current year
    if (a.spec.type === 'UNIT' && b.spec.type === 'NUMBER') {
      if (a.spec.value === 'century') return new CenturyRange(b.spec.value);
      if (a.spec.value === 'millennium') return new MillenniumRange(b.spec.value);
      return new NthIn(a.spec.value, b.spec.value, new YearRange(todayYear));
    }
    // "1st month", "3rd week", "21st century", "3rd millennium"
    if (a.spec.type === 'ORD' && b.spec.type === 'UNIT') {
      if (b.spec.value === 'century') return new CenturyRange(a.spec.value);
      if (b.spec.value === 'millennium') return new MillenniumRange(a.spec.value);
      return new NthIn(b.spec.value, a.spec.value, new YearRange(todayYear));
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'UNIT') {
      return new Period(a.spec.value.kind, b.spec.value);
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'WEEKEND') {
      return new WeekendRange(a.spec.value.kind);
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'WEEKDAY') {
      return new Weekday(a.spec.value.kind, b.spec.value);
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'HOLIDAY') {
      return this.directionalHoliday(a.spec.value.kind, b.spec.value, b.spec.def, todayYear, today);
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'MONTH') {
      let y = todayYear;
      if (a.spec.value.kind === 'next' && b.spec.value <= makeDate(todayYear, 0, 1).getMonth())
        y = todayYear + 1;
      if (a.spec.value.kind === 'last' && b.spec.value >= makeDate(todayYear, 0, 1).getMonth())
        y = todayYear - 1;
      // Simplified — caller should re-evaluate at runtime. Use a Period-style relative wrapper.
      return new MonthRange(b.spec.value, y);
    }
    if (a.spec.type === 'HOLIDAY' && b.spec.type === 'YEAR') {
      return new Holiday(a.spec.value, a.spec.def, b.spec.value);
    }
    if (a.spec.type === 'ZODIAC' && b.spec.type === 'YEAR') {
      return new ZodiacRange(a.spec.value, a.spec.def, b.spec.value);
    }
    if (a.spec.type === 'MONTH' && b.spec.type === 'NUMBER') {
      if (!validDay(todayYear, a.spec.value, b.spec.value)) return null;
      return new MonthDay(a.spec.value, b.spec.value, todayYear);
    }
    if (a.spec.type === 'MONTH' && b.spec.type === 'ORD') {
      if (!validDay(todayYear, a.spec.value, b.spec.value)) return null;
      return new MonthDay(a.spec.value, b.spec.value, todayYear);
    }
    if (a.spec.type === 'NUMBER' && b.spec.type === 'MONTH') {
      if (!validDay(todayYear, b.spec.value, a.spec.value)) return null;
      return new MonthDay(b.spec.value, a.spec.value, todayYear);
    }
    if (a.spec.type === 'ORD' && b.spec.type === 'MONTH') {
      if (!validDay(todayYear, b.spec.value, a.spec.value)) return null;
      return new MonthDay(b.spec.value, a.spec.value, todayYear);
    }
    if (a.spec.type === 'MONTH' && b.spec.type === 'YEAR') {
      return new MonthRange(a.spec.value, b.spec.value);
    }
    if (a.spec.type === 'QUARTER' && b.spec.type === 'YEAR') {
      return new QuarterRange(a.spec.value, b.spec.value);
    }
    if (a.spec.type === 'HALF' && b.spec.type === 'YEAR') {
      return new HalfRange(a.spec.value, b.spec.value);
    }
    if (a.spec.type === 'BOUND' && b.spec.type === 'MONTH') {
      return new BoundOfMonth(a.spec.value, b.spec.value, todayYear);
    }
    return null;
  }

  private parseAtom3(a: Token, b: Token, c: Token, todayYear: number): AstNode | null {
    if (a.spec.type === 'OP' && b.spec.type === 'NUMBER' && c.spec.type === 'UNIT') {
      return new Shift(new Literal(0), a.spec.value as 1 | -1, b.spec.value, c.spec.value);
    }
    if (a.spec.type === 'DIR' && b.spec.type === 'NUMBER' && c.spec.type === 'UNIT') {
      const dk = a.spec.value.kind;
      if (dk === 'this') return null;
      return new Window(dk, b.spec.value, c.spec.value);
    }
    if (a.spec.type === 'UNIT' && b.spec.type === 'NUMBER' && c.spec.type === 'YEAR') {
      return new NthIn(a.spec.value, b.spec.value, new YearRange(c.spec.value));
    }
    if (a.spec.type === 'ORD' && b.spec.type === 'UNIT' && c.spec.type === 'YEAR') {
      return new NthIn(b.spec.value, a.spec.value, new YearRange(c.spec.value));
    }
    if (
      a.spec.type === 'MONTH' &&
      b.spec.type === 'NUMBER' &&
      c.spec.type === 'YEAR' &&
      validDay(c.spec.value, a.spec.value, b.spec.value)
    ) {
      return new MonthDay(a.spec.value, b.spec.value, c.spec.value);
    }
    if (
      a.spec.type === 'MONTH' &&
      b.spec.type === 'ORD' &&
      c.spec.type === 'YEAR' &&
      validDay(c.spec.value, a.spec.value, b.spec.value)
    ) {
      return new MonthDay(a.spec.value, b.spec.value, c.spec.value);
    }
    if (
      a.spec.type === 'NUMBER' &&
      b.spec.type === 'MONTH' &&
      c.spec.type === 'YEAR' &&
      validDay(c.spec.value, b.spec.value, a.spec.value)
    ) {
      return new MonthDay(b.spec.value, a.spec.value, c.spec.value);
    }
    if (
      a.spec.type === 'ORD' &&
      b.spec.type === 'MONTH' &&
      c.spec.type === 'YEAR' &&
      validDay(c.spec.value, b.spec.value, a.spec.value)
    ) {
      return new MonthDay(b.spec.value, a.spec.value, c.spec.value);
    }
    if (
      a.spec.type === 'NUMBER' &&
      b.spec.type === 'OF' &&
      c.spec.type === 'MONTH' &&
      validDay(todayYear, c.spec.value, a.spec.value)
    ) {
      return new MonthDay(c.spec.value, a.spec.value, todayYear);
    }
    // "weekend after next"
    if (
      a.spec.type === 'WEEKEND' &&
      b.spec.type === 'RELPREP' &&
      b.spec.value === 'after' &&
      c.spec.type === 'DIR' &&
      c.spec.value.kind === 'next'
    ) {
      return new WeekendRange('after-next');
    }
    // "early may 2027", "late june 2030"
    if (a.spec.type === 'BOUND' && b.spec.type === 'MONTH' && c.spec.type === 'YEAR') {
      return new BoundOfMonth(a.spec.value, b.spec.value, c.spec.value);
    }
    // "start of <unit>" / "end of <month>"
    if (a.spec.type === 'BOUND' && b.spec.type === 'OF' && c.spec.type === 'UNIT') {
      return new BoundOf(a.spec.value, new Period('this', c.spec.value));
    }
    if (a.spec.type === 'BOUND' && b.spec.type === 'OF' && c.spec.type === 'MONTH') {
      return new BoundOfMonth(a.spec.value, c.spec.value, todayYear);
    }
    return null;
  }

  private parseAtom4(toks: Token[], today?: Date): AstNode | null {
    const todayYear = (today ?? new Date()).getFullYear();
    const [a, b, c, d] = toks;
    if (!a || !b || !c || !d) return null;
    // "first mon of march" / "last fri of october"
    if (isOrdinalLike(a) && b.spec.type === 'WEEKDAY' && ty(c, 'OF') && d.spec.type === 'MONTH') {
      return new NthWeekday(ordValue(a), b.spec.value, new MonthRange(d.spec.value, todayYear));
    }
    // "1st week of sept", "3rd day of march"
    if (isOrdinalLike(a) && b.spec.type === 'UNIT' && ty(c, 'OF') && d.spec.type === 'MONTH') {
      return new NthIn(b.spec.value, ordValue(a), new MonthRange(d.spec.value, todayYear));
    }
    // "1st week of 2027", "5th month of next year"
    if (isOrdinalLike(a) && b.spec.type === 'UNIT' && ty(c, 'OF')) {
      const cont = this.parseAtom([d], today);
      if (cont) return new NthIn(b.spec.value, ordValue(a), cont);
    }
    // "1st week of month" — "this Y"
    if (isOrdinalLike(a) && b.spec.type === 'UNIT' && ty(c, 'OF') && d.spec.type === 'UNIT') {
      return new NthIn(b.spec.value, ordValue(a), new Period('this', d.spec.value));
    }
    return null;
  }

  private parseAtomLong(toks: Token[], today?: Date): AstNode | null {
    // "start/end of <ref>"
    if (toks.length >= 3 && toks[0]?.spec.type === 'BOUND' && ty(toks[1], 'OF')) {
      const ref = this.parseAtom(toks.slice(2), today);
      if (ref) return new BoundOf(toks[0].spec.value, ref);
    }
    // "first/last mon of <monthRef-with-year>"
    if (
      toks.length >= 5 &&
      toks[0] &&
      isOrdinalLike(toks[0]) &&
      toks[1]?.spec.type === 'WEEKDAY' &&
      ty(toks[2], 'OF')
    ) {
      const ref = this.parseAtom(toks.slice(3), today);
      if (ref) {
        return new NthWeekday(ordValue(toks[0]), toks[1].spec.value, ref);
      }
    }
    // "Nth UNIT of <container>" — container may be any range-producing expression
    if (
      toks.length >= 5 &&
      toks[0] &&
      isOrdinalLike(toks[0]) &&
      toks[1]?.spec.type === 'UNIT' &&
      ty(toks[2], 'OF')
    ) {
      const cont = this.parseAtom(toks.slice(3), today);
      if (cont) return new NthIn(toks[1].spec.value, ordValue(toks[0]), cont);
    }
    return null;
  }

  private directionalHoliday(
    dir: 'this' | 'next' | 'last',
    name: string,
    def: Holiday['def'],
    todayYear: number,
    today?: Date,
  ): Holiday {
    const anchor = today ?? makeDate(todayYear, 0, 1);
    const ref = Holiday.computeIn(def, todayYear, anchor);
    if (!ref) return new Holiday(name, def, null);
    let yr = todayYear;
    if (dir === 'this') yr = ref < anchor ? todayYear + 1 : todayYear;
    else if (dir === 'next') yr = ref < anchor ? todayYear + 2 : todayYear + 1;
    else if (dir === 'last') yr = ref > anchor ? todayYear - 1 : todayYear;
    return new Holiday(name, def, yr);
  }
}
