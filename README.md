# Historica

[Historica](https://historica.online) is a beta site for visualising history. It puts people, places and events on a shared timeline so you can explore what was happening elsewhere at the same time.

Choose a person to see their lifetime, follow connections to other people and places, or widen the dates to explore a longer period. The map follows the visible dates. Bookmarks preserve the focus, dates, filters and comparison state.

Coverage is selective. Historical statements link to sources, but a sourced entry doesn't mean the surrounding region or period has been fully researched. Approximate dates, geographical reference points and research gaps are identified in the interface. See [research coverage](https://historica.online/coverage.html).

## Run locally

Use Node.js 26 (the exact development and CI version is in `.node-version`) and Python 3. Run `npm ci` to install the locked build tools. No API keys are needed.

```sh
npm start
```

Open `http://localhost:4173`. For another device on the same Wi-Fi, run `npm run start:lan` and use the computer's LAN address on port 4173.

On macOS, `npm run preview:install` installs the persistent preview service. After edits, `npm run preview:sync` refreshes its copy of the site. Use the Mac's `.local` hostname or LAN address on port 4173; the Mac must be awake. See [release instructions](RELEASE.md) for the review workflow.

## Work on the site

| Location | Purpose |
| --- | --- |
| `web/` | Site source, browser modules and assets |
| `web/data/` | Collection, geography and generated research assets |
| `content/` | Individual histories and their navigation packs |
| `src/` | TypeScript application and Astro pages |
| `research/` | Evidence records, provenance and coverage programme |
| `scripts/` | Validation, generation, preview and release tools |
| `tests/` | Model, routing, data and build checks |
| `design/` | Earlier sketches and prototype references |
| `project/` | Migration status and working notes |

`src/browser/explorer.ts` coordinates the main explorer, with models, controllers and rendering under `src/`. `web/focus-app.js` is its browser entry point and `web/focus.css` supplies the styles. The earlier campaign prototype is still linked from the explorer; its retirement is separate from removing unused migration adapters.

Edit records under `content/` and page templates under `src/pages/`. `npm run build:web` builds and verifies Astro pages, then exports them to the paths used by the local server. Don't edit `web/pages/`, `web/index.html`, `web/about.html` or `web/coverage.html`: they are generated output. The current data layout is transitional; the [sustainability plan](SUSTAINABILITY-PLAN.md) describes the intended replacement.

```sh
npm test                 # model, data, routing and build checks
npm run build:evidence   # validate and generate reviewed evidence
npm run build:coverage   # generate the coverage dashboard data
npm run build:web        # verified Astro pages and assets for the local server
npm run build:site       # complete verification and compatibility output in docs/
npm run build:pages      # portable static export in release/pages-site/
```

Build commands don't publish. `docs/` and `release/` are local build outputs, excluded from Git. History HTML under `web/pages/`, route records, sitemap, robots files and derived research exports are also ignored build output. Tests, preview and packaging generate them from the authored records and templates.

## Static pages

The standard staging build uses Astro for all 230 histories, home, About and research coverage. History pages use the same authored records and timeline calculations as the current explorer. Their introductions, comparisons, regional timelines, fitted maps, connections and research references are generated before the browser runs JavaScript.

```sh
npm run check:static     # strict checks for Astro templates and page models
npm run test:static      # type-check, build and check all Astro HTML
npm run preview:sync    # refresh the existing Wi-Fi preview with verified Astro pages
npm run build:static:incremental   # build and check changed history pages locally
npm run package:static   # alias for build:pages, output in release/pages-site/
```

Open `/person/alexander`, `/person/socrates` or `/area/egypt` on the existing preview. `npm run preview:sync` now uses the same verified Astro pages as the staging build; there is no separate prototype overlay. The older `preview:static` commands are aliases. None of these commands publishes. The Astro output in `release/static-pilot/` contains the history, home, About and research coverage pages. `npm run build:pages` (also `npm run package:static`) combines verified incremental pages with the styles, scripts and data in `release/pages-site/`. CI produces this same Astro package. It checks packaged file hashes, local links and assets, and static page markers. The package is mounted at `/historica/`, excludes indexing and does not publish. Compatibility packaging retains the existing server paths, using the same Astro-generated HTML.

A typed browser coordinator enhances the static pages. Default pages retain their generated content when controls load; customised date, filter and comparison bookmarks still use the runtime renderer. Home search and the research coverage dashboard now use typed controllers; the static package now uses Astro for home, About and coverage as well as every history. Page models and Astro templates are now strictly checked before building. Static pages reuse their embedded world map and fetch only a small regional geometry file. The explorer loads evidence for the selected history, caches visited histories and uses a small shared chronology index for age comparisons. Full research records remain available to the build and coverage page. Local incremental builds and CI reuse verified static pages. Cold caches and shared code changes receive full static verification; content changes check affected pages. A unified runtime state and smaller history payloads remain to be completed. See [pilot notes](project/static-page-pilot.md).

## History data contract

`src/domain/history.ts` defines histories, dated place associations and connections. `src/content/validate-history.ts` validates the assembled legacy collection before it crosses into typed code. `npm run validate:history` checks IDs, source and claim references, date ordering, uncertainty envelopes, geographical coordinates and relationship endpoints. This also runs as part of `npm test` and CI.

Validation preserves the input object and all its fields. It doesn't fill missing locations, invent relationship dates or certify historical claims. Evidence review remains separate. All 230 current histories now live in individual Markdown files with YAML metadata under `content/histories/`. Pack associations and relationships live under `content/packs/`. See [content authoring](content/README.md). Evidence claims and review records still use the legacy format. The prototype data module is generated from authored records; the JavaScript history builders have been removed. Three earlier record versions remain explicitly preserved for the original prototype view.

## Development status

The refactor has started with strict TypeScript in `src/domain/`. Timeline arithmetic now compiles to `web/generated/`, with the existing browser entry point preserved. The history explorer’s models, controls, rendering and browser coordinator now use strict TypeScript. The public browser entry point is a small compatibility adapter. Astro now generates all history routes in the preview; smaller history payloads and dark mode remain planned.

Edit TypeScript source, then run `npm run build:client`. `web/generated/` is ignored build output, recreated from TypeScript and authored history records. The build clears stale modules before compiling and regenerates the prototype data module. `npm start`, `npm run start:lan`, preview installation, tests and packaging build the files they need automatically. CI builds these files from source instead of comparing committed copies. Strict checking applies to migrated TypeScript and Astro templates, not yet to all legacy JavaScript. TypeScript 6 is pinned for compatibility with the Astro checker; Node remains on 26.

Focus changes, date windows and bookmark encoding now live in `src/state/`. `src/controllers/explorer-controls.ts` binds date, year and filter inputs through callbacks, independently of rendering. Browser adapters preserve the existing public module imports and detect the correct path prefix. Search and comparison inputs also have separate controllers, with search ranking in `src/domain/search.ts`. The map controller is also typed, including touch gestures and saved camera state. The main explorer still coordinates rendering and browser history; that migration is ongoing.

## Research and reuse

- [Research programme](research/programme/PLAN.md)
- [Evidence format](research/evidence/FORMAT.md)
- [Original prototype plan](PLAN.md)
- [Prototype milestone](PROTOTYPE-MILESTONE.md)

Code is licensed under [MIT](LICENSE). Original historical summaries and research records use CC BY 4.0. Third-party material retains its own terms; see [attribution](ATTRIBUTION.md) before reusing it.

Created by [Ian Sproates](https://sproates.net).
