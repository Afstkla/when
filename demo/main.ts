/**
 * Demo wiring — consumes the `when-parser` library to render the calendar,
 * conversational sentence, ghost-text autocomplete, drag-to-adjust range
 * handles, and spell-correction chip.
 *
 * No parsing logic lives here; everything semantic is in `src/`.
 *
 * Locale switching: the library is already locale-aware (`English`, `Dutch`),
 * so the demo only needs to wire a small UI table of static strings + example
 * chips + Intl formatter tags, and rebuild Parser/SpellChecker/Suggester when
 * the user flips the toggle.
 */

import {
  addDays,
  addMonths,
  ConversationalFormatter,
  Dutch,
  diffDays,
  English,
  isoFormat,
  isoWeek,
  makeDate,
  moonClipPath,
  moonName,
  moonPhase,
  Parser,
  parse,
  SpellChecker,
  Suggester,
  sameDay,
  startOfDay,
  type Vocabulary,
  type WhenResult,
} from '../src/index.js';

const TODAY = startOfDay(new Date());

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

/* ───────── locale config ───────── */

type LocaleId = 'en' | 'nl';

interface LocaleConfig {
  vocabulary: Vocabulary;
  intlTag: string;
  monthsShort: readonly string[];
  dowHeaders: readonly [string, string, string, string, string, string, string];
  wkHeader: string;
  badgeRange: string;
  badgeEmpty: string;
  badgeNoIdea: string;
  roleStart: string;
  roleEnd: string;
  scrollUp: string;
  scrollDown: string;
  emptyHint: string;
  couldntMakeSense: string;
  didYouMean: string;
  enterHint: string;
  rangeJoinWord: string;
  todayWord: string;
  tomorrowWord: string;
  yesterdayWord: string;
  daysAgo: (n: number) => string;
  daysFrom: (n: number) => string;
  weeksAgo: (n: number) => string;
  weeksFrom: (n: number) => string;
  monthsAgo: (n: number) => string;
  monthsFrom: (n: number) => string;
  dayCount: (n: number) => string;
  monthsBetween: (n: number) => string;
  examples: readonly string[];
  placeholders: readonly string[];
  showProse: boolean;
}

const LOCALES: Record<LocaleId, LocaleConfig> = {
  en: {
    vocabulary: English,
    intlTag: 'en-US',
    monthsShort: [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ],
    dowHeaders: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    wkHeader: 'wk',
    badgeRange: 'RANGE',
    badgeEmpty: 'empty',
    badgeNoIdea: 'no idea',
    roleStart: 'Start ↓',
    roleEnd: '↑ End',
    scrollUp: '↑ earlier',
    scrollDown: 'later ↓',
    emptyHint:
      '<span class="dim">try anything — </span><em>today</em>, <em>yday to tmrw</em>, <em>first mon of march</em>',
    couldntMakeSense: '<span class="dim">couldn\'t make sense of that — keep typing</span>',
    didYouMean: '<span class="dim">did you mean</span>',
    enterHint: 'enter ↵',
    rangeJoinWord: 'to',
    todayWord: 'today',
    tomorrowWord: 'tomorrow · +1d',
    yesterdayWord: 'yesterday · −1d',
    daysAgo: (n) => `${n} days ago`,
    daysFrom: (n) => `in ${n} days`,
    weeksAgo: (n) => `${n} weeks ago`,
    weeksFrom: (n) => `in ${n} weeks`,
    monthsAgo: (n) => `${n} months ago`,
    monthsFrom: (n) => `in ${n} months`,
    dayCount: (n) => `${n} day${n === 1 ? '' : 's'}`,
    monthsBetween: (n) => `month${n === 1 ? '' : 's'} between`,
    examples: [
      'today',
      'tmrw',
      'yday to tmrw',
      'next fri',
      'in 3 weeks',
      '2 mondays from now',
      'last 30 days',
      'this weekend',
      'weekend after next',
      'first mon of march',
      'end of month',
      'week 20',
      '1st week of sept',
      '3rd day of next week',
      'q4 2026',
      '2nd decade of 21st century',
      '2020s',
      'christmas',
      'last christmas',
      'next thanksgiving',
      '10 days before xmas',
      'today + 10 days',
      'next fri + 3 days',
      'may 12 – 19',
      '5/12/26',
      '+45',
    ],
    placeholders: [
      'say when — try “yday to tmrw”',
      'try “next fri” or “first mon of march”',
      'try “in 3 weeks” or “last 30 days”',
      'try “may 12 – 19” or “q4 2026”',
      'try “10 days before xmas”',
      'try “2 mondays from now”',
      'try “2nd decade of 21st century”',
    ],
    showProse: true,
  },
  nl: {
    vocabulary: Dutch,
    intlTag: 'nl-NL',
    monthsShort: [
      'jan',
      'feb',
      'mrt',
      'apr',
      'mei',
      'jun',
      'jul',
      'aug',
      'sep',
      'okt',
      'nov',
      'dec',
    ],
    dowHeaders: ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'],
    wkHeader: 'wk',
    badgeRange: 'BEREIK',
    badgeEmpty: 'leeg',
    badgeNoIdea: 'geen idee',
    roleStart: 'Begin ↓',
    roleEnd: '↑ Eind',
    scrollUp: '↑ eerder',
    scrollDown: 'later ↓',
    emptyHint:
      '<span class="dim">probeer iets — </span><em>vandaag</em>, <em>gisteren tot morgen</em>, <em>eerste maandag van maart</em>',
    couldntMakeSense: '<span class="dim">snap er niks van — blijf typen</span>',
    didYouMean: '<span class="dim">bedoelde je</span>',
    enterHint: 'enter ↵',
    rangeJoinWord: 'tot',
    todayWord: 'vandaag',
    tomorrowWord: 'morgen · +1d',
    yesterdayWord: 'gisteren · −1d',
    daysAgo: (n) => `${n} dagen geleden`,
    daysFrom: (n) => `over ${n} dagen`,
    weeksAgo: (n) => `${n} weken geleden`,
    weeksFrom: (n) => `over ${n} weken`,
    monthsAgo: (n) => `${n} maanden geleden`,
    monthsFrom: (n) => `over ${n} maanden`,
    dayCount: (n) => `${n} dag${n === 1 ? '' : 'en'}`,
    monthsBetween: (n) => `maand${n === 1 ? '' : 'en'} ertussen`,
    examples: [
      'vandaag',
      'morgen',
      'gisteren tot morgen',
      'volgende vrijdag',
      'over 3 weken',
      'afgelopen 30 dagen',
      'dit weekend',
      'eerste maandag van maart',
      'einde van de maand',
      'week 20',
      '1e week van september',
      '3e dag van volgende week',
      'q4 2026',
      '2e decennium van 21e eeuw',
      '2020s',
      'kerstmis',
      'vorige kerst',
      'koningsdag',
      'sinterklaas',
      'pasen',
      'hemelvaartsdag',
      '10 dagen voor kerst',
      'vandaag + 10 dagen',
      'volgende vrijdag + 3 dagen',
      'mei 12 t/m 19',
      '12.5.26',
      '+45',
    ],
    placeholders: [
      'zeg het maar — probeer “gisteren tot morgen”',
      'probeer “volgende vrijdag” of “eerste maandag van maart”',
      'probeer “over 3 weken” of “afgelopen 30 dagen”',
      'probeer “mei 12 t/m 19” of “q4 2026”',
      'probeer “10 dagen voor kerst”',
      'probeer “2e decennium van 21e eeuw”',
    ],
    showProse: false,
  },
};

function detectInitialLocale(): LocaleId {
  const stored = localStorage.getItem('when.locale');
  if (stored === 'en' || stored === 'nl') return stored;
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('nl') ? 'nl' : 'en';
}

/* ───────── live state ───────── */

let currentLocale: LocaleId = detectInitialLocale();
let L = LOCALES[currentLocale];
let parser = new Parser(L.vocabulary);
let spellChecker = new SpellChecker(L.vocabulary, parser);
let suggester = new Suggester(L.vocabulary);
const formatter = new ConversationalFormatter({ today: TODAY, html: true });
let fmtFullDow = new Intl.DateTimeFormat(L.intlTag, { weekday: 'long' });
let fmtMonth = new Intl.DateTimeFormat(L.intlTag, { month: 'long' });

type ParsedState = {
  parsed: WhenResult | null;
  correction: string | null;
  suggestion: string;
};

const state: ParsedState = { parsed: null, correction: null, suggestion: '' };

function relPhrase(d: Date): string {
  const days = diffDays(TODAY, d);
  if (days === 0) return L.todayWord;
  if (days === 1) return L.tomorrowWord;
  if (days === -1) return L.yesterdayWord;
  const abs = Math.abs(days);
  const ago = days < 0;
  if (abs < 60) return ago ? L.daysAgo(abs) : L.daysFrom(abs);
  if (abs < 365) {
    const n = Math.round(abs / 7);
    return ago ? L.weeksAgo(n) : L.weeksFrom(n);
  }
  const n = Math.round(abs / 30);
  return ago ? L.monthsAgo(n) : L.monthsFrom(n);
}

/* ───────── parse + render ───────── */

function runParse(): void {
  const v = ($('q') as HTMLInputElement).value;
  const result = parse(v, { today: TODAY, vocabulary: L.vocabulary });
  state.parsed = result ? { kind: result.kind, start: result.start, end: result.end } : null;
  state.correction = null;
  if (!state.parsed && v.trim()) {
    state.correction = spellChecker.suggest(v);
  }
  renderResult();
  renderSentence();
  renderCalendar();
  updateGhost();

  const row = $('inputRow');
  if (v.trim() && !state.parsed) {
    row.classList.remove('err');
    void row.offsetWidth;
    row.classList.add('err');
  } else {
    row.classList.remove('err');
  }
}

function renderResult(): void {
  const r = state.parsed;
  const result = $('result');
  result.innerHTML = '';

  const text = ($('q') as HTMLInputElement).value;
  if (!text.trim()) {
    result.innerHTML = `
      <span class="badge warn">${L.badgeEmpty}</span>
      <span class="when">${L.emptyHint}</span>
    `;
    $('isoLine').textContent = '—';
    return;
  }
  if (!r) {
    if (state.correction) {
      result.innerHTML = `
        <span class="badge err">${L.badgeNoIdea}</span>
        <span class="when">${L.didYouMean} <button class="hint-btn" id="acceptHint">${state.correction}</button><span class="dim">?</span></span>
        <span class="meta">${L.enterHint}</span>
      `;
      document.getElementById('acceptHint')?.addEventListener('click', acceptCorrection);
    } else {
      result.innerHTML = `
        <span class="badge err">${L.badgeNoIdea}</span>
        <span class="when">${L.couldntMakeSense}</span>
      `;
    }
    $('isoLine').textContent = '—';
    return;
  }

  if (r.kind === 'single' || sameDay(r.start, r.end)) {
    const d = r.start;
    const dist = relPhrase(d);
    result.innerHTML = `
      <span class="badge">${fmtFullDow.format(d).slice(0, 3).toUpperCase()}</span>
      <span class="when">${formatLong(d)}</span>
      <span class="meta">${dist}</span>
    `;
    $('isoLine').textContent = isoFormat(d);
  } else {
    const a = r.start;
    const b = r.end;
    const days = diffDays(a, b) + 1;
    result.innerHTML = `
      <span class="badge">${L.badgeRange}</span>
      <span class="when">${formatLong(a)} <span class="dim">→</span> ${formatLong(b)}</span>
      <span class="meta">${L.dayCount(days)}</span>
    `;
    $('isoLine').textContent = `${isoFormat(a)} → ${isoFormat(b)}`;
  }
}

function formatLong(d: Date): string {
  const day = d.getDate();
  const monthName = fmtMonth.format(d);
  const yr = d.getFullYear();
  const yrTag = yr === TODAY.getFullYear() ? '' : ` <span class="dim">${yr}</span>`;
  return `<em>${day}</em> ${monthName}${yrTag}`;
}

function renderSentence(): void {
  const sentence = $('sentence');
  if (!L.showProse) {
    sentence.innerHTML = '';
    return;
  }
  sentence.innerHTML = formatter.format(state.parsed);
}

function acceptCorrection(): void {
  if (!state.correction) return;
  ($('q') as HTMLInputElement).value = state.correction;
  state.correction = null;
  runParse();
  $('q').focus();
}

/* ───────── calendar render ───────── */

function renderCalendar(): void {
  const strip = $('strip');
  strip.innerHTML = `<div class="scroll-cue top">${L.scrollUp}</div><div class="scroll-cue bot">${L.scrollDown}</div>`;
  strip.className = 'cal-strip';

  const r = state.parsed;
  if (!r) {
    strip.appendChild(renderMonthPanel(TODAY.getFullYear(), TODAY.getMonth(), null));
    return;
  }

  const startKey = r.start.getFullYear() * 12 + r.start.getMonth();
  const endKey = r.end.getFullYear() * 12 + r.end.getMonth();
  const diff = endKey - startKey;
  const isRange = r.kind === 'range' && !sameDay(r.start, r.end);

  if (!isRange || diff === 0) {
    strip.appendChild(
      renderMonthPanel(r.start.getFullYear(), r.start.getMonth(), isRange ? 'both' : null),
    );
    return;
  }

  if (diff === 1) {
    strip.classList.add('panels-2');
    strip.appendChild(renderMonthPanel(r.start.getFullYear(), r.start.getMonth(), 'start'));
    strip.appendChild(renderMonthPanel(r.end.getFullYear(), r.end.getMonth(), 'end'));
    return;
  }

  strip.classList.add('panels-gap');
  strip.appendChild(renderMonthPanel(r.start.getFullYear(), r.start.getMonth(), 'start'));
  strip.appendChild(renderGap(diff - 1));
  strip.appendChild(renderMonthPanel(r.end.getFullYear(), r.end.getMonth(), 'end'));
}

function renderGap(months: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'gap';
  el.innerHTML = `
    <div class="dots">· · ·</div>
    <div class="n">${months}</div>
    <div class="lbl">${L.monthsBetween(months)}</div>
  `;
  return el;
}

function renderMonthPanel(year: number, month: number, role: string | null): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'panel';

  const head = document.createElement('div');
  head.className = 'panel-head';
  const monthName = fmtMonth.format(makeDate(year, month, 1));
  const yrTag = `<span class="yr">${year}</span>`;
  let roleTag = '';
  if (role === 'start') roleTag = `<span class="role start">${L.roleStart}</span>`;
  else if (role === 'end') roleTag = `<span class="role end">${L.roleEnd}</span>`;
  head.innerHTML = `<span class="title">${monthName} ${yrTag}</span>${roleTag}`;
  panel.appendChild(head);

  const dow = document.createElement('div');
  dow.className = 'dow';
  dow.innerHTML =
    `<span class="w-head">${L.wkHeader}</span>` +
    L.dowHeaders.map((h) => `<span>${h}</span>`).join('');
  panel.appendChild(dow);

  const grid = document.createElement('div');
  grid.className = 'grid';

  const first = makeDate(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -startOffset);

  const r = state.parsed;
  const rs = r ? startOfDay(r.start) : null;
  const re = r ? startOfDay(r.end) : null;
  const isRange = r && r.kind === 'range' && !sameDay(r.start, r.end);

  const todayWeek = isoWeek(TODAY);
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    if (i % 7 === 0) {
      const wn = document.createElement('div');
      const wk = isoWeek(d);
      wn.className =
        'week-num' +
        (wk === todayWeek && d.getFullYear() === TODAY.getFullYear() ? ' current' : '');
      wn.textContent = String(wk);
      grid.appendChild(wn);
    }
    const outside = d.getMonth() !== month;
    const isToday = sameDay(d, TODAY);
    let cls = 'cell';
    if (outside) cls += ' outside';
    if (isToday) cls += ' today';

    if (rs && re) {
      const dt = startOfDay(d).getTime();
      if (dt >= rs.getTime() && dt <= re.getTime()) {
        if (isRange) {
          if (sameDay(d, rs)) cls += ' range-start';
          if (sameDay(d, re)) cls += ' range-end';
          if (!sameDay(d, rs) && !sameDay(d, re)) cls += ' in-range';
        } else {
          cls += ' selected';
        }
      }
    }

    const btn = document.createElement('button');
    btn.className = cls;
    btn.dataset.iso = isoFormat(d);
    btn.dataset.moon = moonName(moonPhase(d));
    btn.title = `${d.toDateString()} · ${btn.dataset.moon} moon`;
    btn.append(document.createTextNode(String(d.getDate())));
    const moon = document.createElement('span');
    moon.className = 'moon';
    const lit = document.createElement('span');
    lit.className = 'lit';
    const clip = moonClipPath(moonPhase(d), 3);
    lit.style.clipPath = clip;
    (lit.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = clip;
    moon.appendChild(lit);
    btn.appendChild(moon);
    btn.addEventListener('pointerdown', (e) => onCellDown(e, d, btn));
    btn.addEventListener('click', () => onCellClick(d));
    grid.appendChild(btn);
  }

  panel.appendChild(grid);
  return panel;
}

/* ───────── drag / autoscroll ───────── */

interface DragState {
  active: boolean;
  moved: boolean;
  which: 'start' | 'end' | null;
  startX: number;
  startY: number;
  scrollDir: 0 | 1 | -1;
  scrollTimer: ReturnType<typeof setTimeout> | null;
}

const drag: DragState = {
  active: false,
  moved: false,
  which: null,
  startX: 0,
  startY: 0,
  scrollDir: 0,
  scrollTimer: null,
};

function onCellDown(e: PointerEvent, _d: Date, btn: HTMLElement): void {
  const isHandle = btn.classList.contains('range-start') || btn.classList.contains('range-end');
  drag.moved = false;
  drag.startX = e.clientX;
  drag.startY = e.clientY;
  if (isHandle) {
    e.preventDefault();
    drag.active = true;
    drag.which = btn.classList.contains('range-start') ? 'start' : 'end';
    document.body.classList.add('dragging');
  } else {
    drag.active = false;
  }
}

function onGlobalMove(e: PointerEvent): void {
  if (!drag.active) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;
  if (!drag.moved && dx * dx + dy * dy > 9) drag.moved = true;
  if (!drag.moved) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el?.closest<HTMLElement>('.cell');
  if (cell?.dataset.iso) {
    if (cell.classList.contains('outside')) {
      const cd = parseIsoCellDate(cell.dataset.iso);
      const ref = drag.which === 'start' ? state.parsed?.start : state.parsed?.end;
      if (!ref) return;
      setScrollDir(cd > ref ? 1 : -1);
    } else {
      cancelScroll();
      applyDragTo(parseIsoCellDate(cell.dataset.iso));
    }
    return;
  }
  checkScrollEdge(e);
}

function checkScrollEdge(e: PointerEvent): void {
  const strip = $('strip');
  const rect = strip.getBoundingClientRect();
  const EDGE = 56;

  if (e.clientY < rect.top + EDGE) {
    setScrollDir(-1);
    return;
  }
  if (e.clientY > rect.bottom - EDGE) {
    setScrollDir(1);
    return;
  }

  const gap = strip.querySelector('.gap');
  if (gap) {
    const gr = gap.getBoundingClientRect();
    if (e.clientY >= gr.top - 8 && e.clientY <= gr.bottom + 8) {
      setScrollDir(drag.which === 'start' ? 1 : -1);
      return;
    }
  } else {
    const panels = strip.querySelectorAll<HTMLElement>('.panel');
    if (panels.length === 2 && panels[0] && panels[1]) {
      const aBot = panels[0].getBoundingClientRect().bottom;
      const bTop = panels[1].getBoundingClientRect().top;
      if (e.clientY >= aBot - 10 && e.clientY <= bTop + 10) {
        setScrollDir(drag.which === 'start' ? 1 : -1);
        return;
      }
    }
  }
  setScrollDir(0);
}

function setScrollDir(dir: 0 | 1 | -1): void {
  if (dir !== drag.scrollDir) {
    cancelScroll();
    drag.scrollDir = dir;
    if (dir !== 0) scrollTick(dir, true);
  }
  const strip = $('strip');
  if (dir > 0) strip.dataset.scrolling = 'down';
  else if (dir < 0) strip.dataset.scrolling = 'up';
  else delete strip.dataset.scrolling;
}

function scrollTick(dir: 1 | -1, first: boolean): void {
  if (!drag.active || drag.scrollDir !== dir) return;
  const r = state.parsed;
  if (r && drag.which) {
    const ref = drag.which === 'start' ? r.start : r.end;
    applyDragTo(addMonths(ref, dir));
  }
  drag.scrollTimer = setTimeout(() => scrollTick(dir, false), first ? 220 : 320);
}

function cancelScroll(): void {
  if (drag.scrollTimer) clearTimeout(drag.scrollTimer);
  drag.scrollTimer = null;
  drag.scrollDir = 0;
  delete $('strip').dataset.scrolling;
}

function applyDragTo(newDate: Date): void {
  const r = state.parsed;
  if (!r || !drag.which) return;
  let s = r.start;
  let e = r.end;
  if (drag.which === 'start') s = newDate;
  else e = newDate;
  if (s > e) {
    [s, e] = [e, s];
    drag.which = drag.which === 'start' ? 'end' : 'start';
  }
  state.parsed = { kind: 'range', start: s, end: e };
  renderResult();
  renderSentence();
  renderCalendar();
}

function onGlobalUp(): void {
  if (!drag.active) return;
  cancelScroll();
  document.body.classList.remove('dragging');
  if (drag.moved && state.parsed) {
    const r = state.parsed;
    ($('q') as HTMLInputElement).value = fmtRangeForInput(r.start, r.end);
  }
  drag.active = false;
  drag.moved = false;
}

function onCellClick(d: Date): void {
  if (drag.moved) {
    drag.moved = false;
    return;
  }
  ($('q') as HTMLInputElement).value = isoFormat(d);
  runParse();
  $('q').focus();
}

function parseIsoCellDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return makeDate(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

function fmtForInput(d: Date): string {
  const mo = L.monthsShort[d.getMonth()];
  const yr = d.getFullYear() === TODAY.getFullYear() ? '' : ` ${d.getFullYear()}`;
  return `${mo} ${d.getDate()}${yr}`;
}
function fmtRangeForInput(a: Date, b: Date): string {
  return `${fmtForInput(a)} ${L.rangeJoinWord} ${fmtForInput(b)}`;
}

/* ───────── ghost text autocomplete ───────── */

function updateGhost(): void {
  const q = $('q') as HTMLInputElement;
  const shadow = q.parentElement?.querySelector('.shadow') as HTMLElement | null;
  if (!shadow) return;
  const typed = shadow.querySelector<HTMLElement>('.typed');
  const ghost = shadow.querySelector<HTMLElement>('.ghost');
  if (!typed || !ghost) return;
  const v = q.value;
  typed.textContent = v;
  const atEnd = q.selectionStart === v.length && q.selectionEnd === v.length;
  ghost.textContent = atEnd ? suggester.suggest(v) : '';
  state.suggestion = ghost.textContent;
}

function acceptGhost(): boolean {
  if (!state.suggestion) return false;
  const q = $('q') as HTMLInputElement;
  q.value += state.suggestion;
  state.suggestion = '';
  runParse();
  q.setSelectionRange(q.value.length, q.value.length);
  return true;
}

/* ───────── locale switching ───────── */

function renderExamples(): void {
  const host = $('examples');
  host.innerHTML = L.examples
    .map((s) => `<button type="button" class="ex">${escapeHtml(s)}</button>`)
    .join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

function setLocale(loc: LocaleId): void {
  if (loc === currentLocale) return;
  currentLocale = loc;
  L = LOCALES[loc];
  parser = new Parser(L.vocabulary);
  spellChecker = new SpellChecker(L.vocabulary, parser);
  suggester = new Suggester(L.vocabulary);
  fmtFullDow = new Intl.DateTimeFormat(L.intlTag, { weekday: 'long' });
  fmtMonth = new Intl.DateTimeFormat(L.intlTag, { month: 'long' });
  localStorage.setItem('when.locale', loc);

  for (const btn of $('localeToggle').querySelectorAll<HTMLButtonElement>('.loc-btn')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.locale === loc));
  }
  renderExamples();
  // Clear the input — what worked in EN likely won't parse in NL.
  ($('q') as HTMLInputElement).value = '';
  placeholderIndex = 0;
  ($('q') as HTMLInputElement).placeholder = L.placeholders[0] ?? '';
  runParse();
}

/* ───────── wiring ───────── */

const q = $('q') as HTMLInputElement;
q.addEventListener('input', runParse);
q.addEventListener('keyup', updateGhost);
q.addEventListener('click', updateGhost);
q.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && state.suggestion && !e.shiftKey) {
    e.preventDefault();
    acceptGhost();
    return;
  }
  if (e.key === 'ArrowRight' && state.suggestion) {
    if (q.selectionStart === q.value.length) {
      e.preventDefault();
      acceptGhost();
      return;
    }
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (state.correction) {
      acceptCorrection();
      return;
    }
    q.select();
  }
  if (e.key === 'Escape') {
    q.value = '';
    runParse();
  }
});

document.addEventListener('pointermove', onGlobalMove);
document.addEventListener('pointerup', onGlobalUp);
document.addEventListener('pointercancel', onGlobalUp);

$('examples').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.ex');
  if (!b) return;
  q.value = b.textContent ?? '';
  runParse();
  q.focus();
});

$('localeToggle').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.loc-btn');
  if (!b?.dataset.locale) return;
  setLocale(b.dataset.locale as LocaleId);
});

let placeholderIndex = 0;
setInterval(() => {
  if (document.activeElement !== q && !q.value) {
    placeholderIndex = (placeholderIndex + 1) % L.placeholders.length;
    q.placeholder = L.placeholders[placeholderIndex] ?? '';
  }
}, 3200);

/* ───────── init ───────── */

for (const btn of $('localeToggle').querySelectorAll<HTMLButtonElement>('.loc-btn')) {
  btn.setAttribute('aria-pressed', String(btn.dataset.locale === currentLocale));
}
q.placeholder = L.placeholders[0] ?? '';
renderExamples();
runParse();
