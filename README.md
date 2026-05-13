# when

A natural-language date parser. Type how you actually think.

```ts
import { parse } from 'when-parser';

parse('next fri + 3 days');
parse('first monday of march');
parse('last 30 days');
parse('2nd decade of 21st century');
parse('yday to tmrw');
parse('volgende vrijdag', { vocabulary: Dutch });
```

→ **[Live demo](https://afstkla.github.io/when/)** · **[Repo](https://github.com/Afstkla/when)**

## Why

Date pickers are awful. Dropdowns, clicking through months, missing the "two Fridays from now" you actually wanted. So instead: a tiny input that understands how people actually talk about dates.

It's also a from-scratch tokenizer → parser → AST → evaluator, in pure TypeScript, with zero runtime dependencies.

## What it understands

| Phrase                              | Result                                    |
| ----------------------------------- | ----------------------------------------- |
| `today`, `tmrw`, `yday`             | Literals & their abbreviations            |
| `next fri`, `last monday`           | Directional weekdays                      |
| `in 3 weeks`, `3 weeks ago`         | Relative offsets                          |
| `today + 10 days`, `next fri + 3`   | Arithmetic on any anchor                  |
| `yday to tmrw`, `mon – fri`         | Ranges                                    |
| `this weekend`, `weekend after next`| Weekend windows                           |
| `last 30 days`, `next 2 weeks`      | Sliding windows                           |
| `first mon of march`                | Nth weekday in container                  |
| `1st week of sept`, `3rd month of 2027` | Nth (unit) in (container)             |
| `week 20`, `month 3`, `q4 2026`     | Indexed periods                           |
| `start of month`, `end of next year`| Boundaries                                |
| `christmas`, `next thanksgiving`    | Holidays                                  |
| `last christmas`, `easter`          | Directional + Easter-relative             |
| `scorpio`, `leo 2027`               | Zodiac ranges                             |
| `2020s`, `21st century`             | Decades, centuries, millennia             |
| `5/12/26`, `12.5.2026`              | Locale-aware numeric dates                |
| `next 5 business days`              | Business-day math                         |

Spell correction (Levenshtein) and ghost-text autocomplete are built in.

## Install

```bash
npm install when-parser
```

## Usage

```ts
import { parse } from 'when-parser';

const r = parse('next fri to fri after');
if (r) {
  console.log(r.kind);  // 'single' or 'range'
  console.log(r.start); // Date
  console.log(r.end);   // Date
  console.log(r.ast);   // AST node — useful for introspection
}
```

### Options

```ts
parse('volgende vrijdag', {
  today: new Date('2026-05-12'),  // reference point for relative dates
  vocabulary: Dutch,              // English (default) or Dutch
});
```

### Reusable parser instance

```ts
import { Parser, English } from 'when-parser';

const parser = new Parser(English);
const ast = parser.parse('next fri', { today: new Date() });
const result = ast?.evaluate({ today: new Date() });
```

### Spell correction & autocomplete

```ts
import { SpellChecker, Suggester, Parser, English } from 'when-parser';

const checker = new SpellChecker(English, new Parser(English));
checker.suggest('nxt firday');        // → 'nxt friday'

const suggester = new Suggester(English);
suggester.complete('next f');         // → 'next friday'
```

### Conversational output

```ts
import { ConversationalFormatter } from 'when-parser';

const fmt = new ConversationalFormatter({ today: new Date() });
fmt.format(parse('next fri')!);
// "It's a Friday — week 21, waning gibbous moon"
```

## Locales

English (`English`) and Dutch (`Dutch`) ship in the box.

Adding a locale = one file: a phrase map (`weekdays`, `months`, `units`, `directions`, `holidays`, `zodiacs`, …), a few rewrites for idioms, an article set, and a date format. See `src/vocabulary/en.ts` and `src/vocabulary/nl.ts`.

## Architecture

Three layers, no magic:

```
input string
  ↓  Tokenizer (locale-aware, multi-word phrase matching, idiom rewrites)
Token[]
  ↓  Parser (recursive descent)
AstNode
  ↓  .evaluate({ today })
WhenResult ({ kind, start, end })
```

The AST is class-based: `AstNode` → `DateNode` / `RangeNode` → concrete nodes (`Weekday`, `NthIn`, `Holiday`, `ZodiacRange`, `EraRange`, …). Each node knows how to compute itself.

## Development

```bash
npm install
npm run dev          # demo at http://localhost:5173
npm run test         # 86 tests
npm run typecheck
npm run lint
npm run build:lib    # library → dist/
```

## License

MIT
