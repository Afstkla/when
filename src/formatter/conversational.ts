/**
 * Conversational rendering of a parse result — a one-sentence prose summary
 * with the day of the week, relative duration, and ISO week. Uses `Intl` for
 * locale-aware formatting at the display layer (separate from vocabulary).
 */

import { diffDays, isoWeek, sameDay } from '../dates.js';
import { moonName, moonPhase } from '../moon.js';
import type { WhenResult } from '../types.js';

export interface ConversationalOptions {
  /** BCP-47 locale tag for Intl formatting. Default: `en-US`. */
  readonly locale?: string;
  /** "Today" reference (for relative phrasing). Default: now. */
  readonly today?: Date;
  /** If true, the output is HTML with `<em>` for emphasis; otherwise plain text. */
  readonly html?: boolean;
}

export class ConversationalFormatter {
  constructor(private readonly options: ConversationalOptions = {}) {}

  format(r: WhenResult | null): string {
    if (!r) return '';
    const today = this.options.today ?? new Date();
    if (r.kind === 'single' || sameDay(r.start, r.end)) {
      return this.single(r.start, today);
    }
    return this.range(r.start, r.end, today);
  }

  private single(d: Date, today: Date): string {
    const dow = this.dowLong(d);
    const days = diffDays(today, d);
    const wk = isoWeek(d);
    const sameYear = d.getFullYear() === today.getFullYear();
    const fmt = this.dateLong(d, !sameYear);
    const em = (s: string): string => (this.options.html ? `<em>${s}</em>` : s);

    if (days === 0) return `It’s a ${em(dow)} — week ${wk}, ${moonName(moonPhase(d))} moon.`;
    if (days === 1)
      return `Tomorrow is a ${em(dow)}, in week ${wk}, ${moonName(moonPhase(d))} moon.`;
    if (days === -1) return `Yesterday was a ${em(dow)}, in week ${wk}.`;
    const ago = days < 0;
    const dur = humanDuration(Math.abs(days));
    const moonTag = ago ? '' : `, ${moonName(moonPhase(d))} moon`;
    return `${em(`${dow} ${fmt}`)} is ${em(dur)} ${ago ? 'ago' : 'from now'}, in week ${wk}${moonTag}.`;
  }

  private range(a: Date, b: Date, today: Date): string {
    const days = diffDays(a, b) + 1;
    const dur = humanDuration(days);
    const sameYr = a.getFullYear() === b.getFullYear();
    const fmtA = this.dateLong(a, !sameYr || a.getFullYear() !== today.getFullYear());
    const fmtB = this.dateLong(b, true);
    const wkA = isoWeek(a);
    const wkB = isoWeek(b);
    const wkPart = wkA === wkB ? `week ${wkA}` : `weeks ${wkA}–${wkB}`;
    const em = (s: string): string => (this.options.html ? `<em>${s}</em>` : s);
    return `${em(dur)} from ${em(`${this.dowShort(a)} ${fmtA}`)} to ${em(`${this.dowShort(b)} ${fmtB}`)} — ${wkPart}.`;
  }

  private dowLong(d: Date): string {
    return d.toLocaleDateString(this.options.locale ?? 'en-US', { weekday: 'long' });
  }
  private dowShort(d: Date): string {
    return d.toLocaleDateString(this.options.locale ?? 'en-US', { weekday: 'short' });
  }
  private dateLong(d: Date, showYear: boolean): string {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    if (showYear) opts.year = 'numeric';
    return d.toLocaleDateString(this.options.locale ?? 'en-GB', opts);
  }
}

export function humanDuration(days: number): string {
  if (days <= 1) return `${days} day`;
  if (days < 60) return `${days} days`;
  if (days < 365) return `${Math.round(days / 7)} weeks`;
  const years = days / 365.25;
  const wholeY = Math.floor(years);
  const remDays = Math.round(days - wholeY * 365.25);
  if (remDays === 0) return `${wholeY} year${wholeY === 1 ? '' : 's'}`;
  if (remDays < 7) return `${wholeY} year${wholeY === 1 ? '' : 's'}`;
  if (remDays < 30) return `${wholeY} year${wholeY === 1 ? '' : 's'} and ${remDays} days`;
  const months = Math.round(remDays / 30.4);
  return `${wholeY} year${wholeY === 1 ? '' : 's'} and ${months} month${months === 1 ? '' : 's'}`;
}
