# Historica

[Historica](https://historica.online) is a beta site for visualising history. Explore people, places and events on a shared timeline, with a map alongside it. Follow connections or change the dates to see what was happening elsewhere.

Coverage is selective. Entries link to sources and describe uncertain dates and geographical references. Missing records mean missing research, not that nothing happened.

## Develop locally

Use Node.js 26, pinned in `.node-version`, and Python 3. Install locked dependencies with `npm ci`.

```sh
npm start                  # local server on port 4173
npm run start:lan          # accessible on the same Wi-Fi
npm run preview:sync       # refresh the installed persistent macOS preview
npm test                   # types, static pages, data and application checks
npm run build:pages        # verified standalone package in release/pages-site/
```

Builds do not publish. The persistent preview runs independently of the terminal; use the Mac's `.local` hostname on port 4173. The Mac must be awake. `npm run preview:install` installs the service if it is not already present.

## Source layout

| Location | Purpose |
| --- | --- |
| `content/histories/` | Individual historical records in Markdown |
| `content/packs/` | Navigation groups, associations and relationships in YAML |
| `research/` | Source passages, evidence reviews and coverage records |
| `src/pages/`, `src/layouts/`, `src/components/` | Astro pages and shared HTML |
| `src/domain/`, `src/state/` | Typed history calculations, focus transitions and bookmarks |
| `src/browser/`, `src/controllers/` | Typed interactions and browser integration |
| `src/presentation/`, `src/content/` | Rendering models, validation and browser projections |
| `web/` | Shared assets, styles and small browser entry points |
| `scripts/`, `tests/` | Build, verification, preview and packaging |

Edit TypeScript under `src/`; compile it with `npm run build:client`. Generated `web/generated/`, `web/pages/`, home/About/coverage HTML and derived JSON are ignored output. Do not edit them. The main explorer and home search no longer load prototype records. The earlier campaign view remains available for existing links, with its isolated compatibility code.

## Build and verification

`build:content` validates authored records and generates routing, discovery metadata and browser data. `build:web` then builds and verifies affected Astro pages and exports the existing server paths. Home, About, privacy, coverage and all 230 history pages come from Astro. Default histories contain their introduction, timeline, map and references before JavaScript runs.

Incremental builds track page inputs and output hashes. Unchanged pages reuse their verification; shared application changes trigger wider checks. CI follows the same build and retains a checksummed staging package. Allowlisted internal documentation skips site generation. Changes to content and unknown files do not take that shortcut.

Home search uses a compact index. The explorer loads assembled records plus evidence for the selected history, caching evidence as visitors navigate. Historical validation checks structure and references; it does not certify the underlying claims. See [content authoring](content/README.md) and [evidence format](research/evidence/FORMAT.md).

## Appearance and analytics

`web/appearance.css` defines shared light/dark tokens and layout refinements. The moon button toggles light and dark. Until a choice is saved, appearance follows the system; the preference is local to the browser and is applied before paint. Keep map, timeline, keyboard focus and uncertainty patterns legible in both modes.

Analytics is optional and disabled in previews. A production Pages package can read `HISTORICA_ANALYTICS_TOKEN` for the Historica-specific Cloudflare Web Analytics site. The loader checks the exact production hostname and initializes once. Automatic SPA tracking is disabled: counts represent document visits, not every in-page focus change or slider movement. No custom search or comparison telemetry is added. See [release instructions](RELEASE.md) before enabling it.

## Contribution and release

Use a short descriptive branch and a PR; main is protected. Run checks proportionate to the change. Preview design, wording and interaction changes on Wi-Fi before release approval. Keep related refactor work together rather than creating a sequence of micro-PRs. Data changes need the relevant data checks.

[Release readiness](project/release-readiness.md) records the remaining release gates. Earlier plans and migration notes are historical context, not an additional backlog. [Release instructions](RELEASE.md) cover packaging and rollback.

Code uses [MIT](LICENSE); original historical summaries and research records use CC BY 4.0. Third-party material retains its own terms: see [attribution](ATTRIBUTION.md).

Created by [Ian Sproates](https://sproates.net).
