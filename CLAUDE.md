# CLAUDE.md

Project-level guidance for Claude Code.

## What this is

A from-scratch natural-language date parser written in TypeScript, published as the `when-parser` library, with a Vite-built demo deployed to GitHub Pages. Zero runtime dependencies; everything (tokenizer, parser, AST evaluator, spell checker, autocomplete, conversational formatter, moon-phase math, locales) is hand-rolled.

Repo: https://github.com/Afstkla/when · Demo: https://afstkla.github.io/when/

## Architecture

Three layers — keep them clean:

```
string → Tokenizer → Token[] → Parser → AstNode → .evaluate(ctx) → WhenResult
```

- **`src/tokenizer/`** — `Tokenizer.normalize()` lowercases, applies `vocabulary.rewrites`, strips articles. `Tokenizer.tokenize()` does longest-first multi-word phrase matching against `vocabulary.phrases`, then single-word fallback for numbers, dates, signed offsets. **The tokenizer is locale-agnostic** — anything locale-specific lives in the vocabulary.
- **`src/parser/Parser.ts`** — recursive descent. Public `parse(input, options)` returns an `AstNode`. Atom rules are split across `parseAtom1..4` and `parseAtomLong`.
- **`src/ast/`** — class-based AST. `AstNode` is the abstract base. `DateNode` / `RangeNode` wrap `computeDate()` / `computeRange()` in `Result.single()` / `Result.range()`. Specialized intermediate classes: `EraRange` (decade/century/millennium) and `MonthBlockRange` (month/quarter/half). Each concrete node implements its own `evaluate(ctx)`. **Prefer adding a new node class over a special case in the parser.**
- **`src/vocabulary/`** — locale data. `Vocabulary` interface = phrases Map + articles + dateFormat + ordinalSuffix + rewrites + id. Locales: `en.ts` (English), `nl.ts` (Dutch).
- **`src/spellcheck/`** — Levenshtein with early-exit cap, `SpellChecker` only suggests corrections that actually parse.
- **`src/autocomplete/Suggester.ts`** — ghost-text prefix completion ranked by a curated common-phrase list.
- **`src/formatter/conversational.ts`** — `ConversationalFormatter` for prose output.
- **`src/dates.ts`** / **`src/moon.ts`** — pure date math (ISO weeks, business days, Easter, etc.) and moon phase calculations.

## Conventions

- **Vocabulary `phrases` Map ordering matters.** Last `set()` wins for the same key. In `buildPhrases()`, set entries in increasing-priority order: HOLIDAYS → ZODIACS → LITERALS → ORDINALS → MONTHS → WEEKDAYS → UNITS → DIRECTIONS. `last` must resolve as DIR, not ORD.
- **Idioms belong in `vocabulary.rewrites`**, not the tokenizer. Rewrites are `[RegExp, replacement]` pairs applied during `normalize()`. E.g. `from now/today` → `__forward__` sentinel.
- **No runtime dependencies.** Dev-only (`devDependencies`). Keep it that way.
- **Strict TypeScript** — `noUncheckedIndexedAccess`, `noImplicitOverride`, etc. No `any` (Biome enforces `noExplicitAny`).
- **Tests are the contract.** When changing parser behavior, update tests rather than working around them silently. `tests/parser.test.ts` is the English coverage; `tests/dutch.test.ts` is Dutch.
- **Never call `new Date(year, m, d)` or `Date.UTC(year, m, d)` directly.** JavaScript maps years 0–99 to 1900–1999 (legacy two-digit-year handling), which silently breaks early eras like "1st millennium". Use `makeDate` / `makeUtcDate` from `src/dates.ts` — they write the literal year via `setFullYear`. The only places allowed to start from a raw integer year are these helpers themselves.
- **AST nodes that have a range, operate on the range.** Don't extract `getFullYear()` + `getMonth()` from `range.start` to rebuild dates from scratch — that bypasses the range abstraction and re-opens the year-0 trap. Iterate `[start, end]` with `addDays` (`NthWeekday` is the canonical example).

## Commands

```bash
npm run dev            # demo at :5173
npm run test           # vitest run (86 tests)
npm run test:watch
npm run typecheck      # tsc --noEmit
npm run lint           # biome check
npm run lint:fix
npm run build:lib      # library → dist/
npm run build          # demo → dist-demo/ (for GitHub Pages)
npm run ci             # typecheck + lint + test
```

## CI / Deploy

- `.github/workflows/ci.yml` — typecheck + lint + test + library build on every push/PR to `main`.
- `.github/workflows/pages.yml` — builds the demo and deploys to GitHub Pages on push to `main`. Vite `base` is set to `/when/` for production builds (see `vite.config.ts`).

## Common pitfalls

- **Touching the tokenizer for a locale-specific quirk**: instead, add a rewrite to the locale's `REWRITES` array, or a new phrase to its phrase map.
- **Adding a parser special case for a new pattern**: first check whether `NthIn { unit, n, container }` can express it. It generalizes "Nth UNIT of TIMERANGE" for almost everything.
- **Date math by hand inside an AST node**: use helpers in `src/dates.ts` (`addDays`, `addMonths`, `startOfMonth`, `isoWeek`, `nthWeekdayInMonth`, …).
- **Forgetting to export from `src/index.ts`** when adding public surface — that's the published API.
