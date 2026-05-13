import { describe, expect, it } from 'vitest';
import { isoFormat } from '../src/dates.js';
import { Dutch, parse } from '../src/index.js';

const TODAY = new Date(2026, 4, 12); // Tue 12 May 2026

function fmt(s: string): string {
  const r = parse(s, { today: TODAY, vocabulary: Dutch });
  if (!r) return 'FAIL';
  return r.kind === 'range'
    ? `range ${isoFormat(r.start)} → ${isoFormat(r.end)}`
    : `single ${isoFormat(r.start)}`;
}

describe('Dutch literals', () => {
  it('parses vandaag/morgen/gisteren', () => {
    expect(fmt('vandaag')).toBe('single 2026-05-12');
    expect(fmt('nu')).toBe('single 2026-05-12');
    expect(fmt('morgen')).toBe('single 2026-05-13');
    expect(fmt('gisteren')).toBe('single 2026-05-11');
    expect(fmt('overmorgen')).toBe('single 2026-05-14');
    expect(fmt('eergisteren')).toBe('single 2026-05-10');
  });
});

describe('Dutch weekdays + months', () => {
  it('parses weekdays with direction', () => {
    expect(fmt('volgende vrijdag')).toBe('single 2026-05-15');
    expect(fmt('vorige maandag')).toBe('single 2026-05-11');
    expect(fmt('deze donderdag')).toBe('single 2026-05-14');
    expect(fmt('komende zaterdag')).toBe('single 2026-05-16');
  });

  it('parses month + day in either order', () => {
    expect(fmt('12 mei')).toBe('single 2026-05-12');
    expect(fmt('mei 12')).toBe('single 2026-05-12');
    expect(fmt('12 mei 2027')).toBe('single 2027-05-12');
  });

  it('parses EU dot date', () => {
    expect(fmt('12.5.2026')).toBe('single 2026-05-12');
  });

  it('parses EU slash date (day first)', () => {
    expect(fmt('12/5/2026')).toBe('single 2026-05-12');
  });
});

describe('Dutch periods', () => {
  it('parses deze/volgende/vorige week|maand|jaar|kwartaal', () => {
    expect(fmt('deze week')).toBe('range 2026-05-11 → 2026-05-17');
    expect(fmt('volgende week')).toBe('range 2026-05-18 → 2026-05-24');
    expect(fmt('vorige week')).toBe('range 2026-05-04 → 2026-05-10');
    expect(fmt('deze maand')).toBe('range 2026-05-01 → 2026-05-31');
    expect(fmt('dit jaar')).toBe('range 2026-01-01 → 2026-12-31');
    expect(fmt('volgend kwartaal')).toBe('range 2026-07-01 → 2026-09-30');
  });

  it('parses weekend variants', () => {
    expect(fmt('dit weekend')).toBe('range 2026-05-16 → 2026-05-17');
    expect(fmt('volgend weekend')).toBe('range 2026-05-23 → 2026-05-24');
  });
});

describe('Dutch offsets + windows', () => {
  it('handles "over N units" and "N units geleden"', () => {
    expect(fmt('over 3 weken')).toBe('single 2026-06-02');
    expect(fmt('3 dagen geleden')).toBe('single 2026-05-09');
    expect(fmt('over 10 dagen')).toBe('single 2026-05-22');
  });

  it('parses windows', () => {
    expect(fmt('volgende 7 dagen')).toBe('range 2026-05-12 → 2026-05-18');
    expect(fmt('afgelopen 30 dagen')).toBe('range 2026-04-13 → 2026-05-12');
  });
});

describe('Dutch ranges', () => {
  it('parses "X tot Y" and "vanaf X tot Y"', () => {
    expect(fmt('gisteren tot morgen')).toBe('range 2026-05-11 → 2026-05-13');
    expect(fmt('vanaf maandag tot vrijdag')).toBe('range 2026-05-15 → 2026-05-18');
    expect(fmt('mei 12 t/m 19')).toBe('range 2026-05-12 → 2026-05-19');
  });

  it('parses "tussen X en Y"', () => {
    expect(fmt('tussen 1 juli en 15 augustus')).toBe('range 2026-07-01 → 2026-08-15');
  });
});

describe('Dutch holidays', () => {
  it('parses Dutch-specific holidays', () => {
    expect(fmt('koningsdag')).toBe('single 2027-04-27');
    expect(fmt('sinterklaas')).toBe('single 2026-12-05');
    expect(fmt('kerstmis')).toBe('single 2026-12-25');
    expect(fmt('tweede kerstdag')).toBe('single 2026-12-26');
    expect(fmt('oudejaarsavond')).toBe('single 2026-12-31');
    expect(fmt('bevrijdingsdag')).toBe('single 2027-05-05');
  });

  it('computes Easter-relative holidays', () => {
    // Easter 2026 = April 5 (already past on May 12), so most roll to 2027,
    // except Hemelvaart (Easter+39 = May 14 2026) and Pinksteren
    // (Easter+49 = May 24 2026) which are still upcoming.
    expect(fmt('pasen')).toBe('single 2027-03-28');
    expect(fmt('tweede paasdag')).toBe('single 2027-03-29');
    expect(fmt('goede vrijdag')).toBe('single 2027-03-26');
    expect(fmt('hemelvaartsdag')).toBe('single 2026-05-14');
    expect(fmt('pinksteren')).toBe('single 2026-05-24');
  });

  it('parses directional holidays', () => {
    expect(fmt('vorige kerst')).toBe('single 2025-12-25');
    expect(fmt('volgende koningsdag')).toBe('single 2028-04-27');
  });
});

describe('Dutch zodiac signs', () => {
  it('parses Dutch zodiac names', () => {
    expect(fmt('schorpioen')).toBe('range 2026-10-23 → 2026-11-21');
    expect(fmt('stier')).toBe('range 2026-04-20 → 2026-05-20');
    expect(fmt('steenbok')).toBe('range 2026-12-22 → 2027-01-19');
    expect(fmt('leeuw 2027')).toBe('range 2027-07-23 → 2027-08-22');
  });
});

describe('Dutch ordinals + Nth-in patterns', () => {
  it('parses Dutch ordinal forms', () => {
    expect(fmt('eerste maandag van maart')).toBe('single 2026-03-02');
    expect(fmt('laatste vrijdag van oktober 2027')).toBe('single 2027-10-29');
    expect(fmt('1e week van september')).toBe('range 2026-08-31 → 2026-09-06');
    expect(fmt('3e maand van 2027')).toBe('range 2027-03-01 → 2027-03-31');
  });
});

describe('Dutch eras', () => {
  it('parses decades, centuries, millennia', () => {
    expect(fmt('2020s')).toBe('range 2020-01-01 → 2029-12-31');
    expect(fmt('21e eeuw')).toBe('range 2000-01-01 → 2099-12-31');
    expect(fmt('volgend decennium')).toBe('range 2030-01-01 → 2039-12-31');
  });
});

describe('Dutch articles', () => {
  it('strips de/het/een without breaking idioms', () => {
    expect(fmt('de volgende vrijdag')).toBe('single 2026-05-15');
    expect(fmt('het einde van de maand')).toBe('single 2026-05-31');
  });
});
