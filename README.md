# Historica

[Historica](https://historica.online) is a site for visualising history. It puts people, places and events on a shared timeline so you can see what was happening at the same time in different parts of the world.

Who was alive during Alexander’s lifetime? What was happening in Britain while Socrates was alive? Where was Bactria, and how does it relate to the countries we know today? These are the sorts of questions Historica is intended to help you explore.

Choose a person, place, event or period as your focus, then change the dates or follow a connection. The map shows related places. Hover over a marker to identify it, or select it and choose Explore to move there. You can bookmark a view and return to the same focus and settings.

Historica is still a beta. The collection concentrates on the ancient world and coverage is uneven. Entries link to their sources, with notes where dates or locations are uncertain. A gap in the timeline means we haven't covered something yet, not that nothing happened there.

## Run it locally

You'll need Node.js 26, pinned in `.node-version`, and Python 3.

```sh
npm ci
npm start
```

The local server runs on port 4173. To open it from a phone on the same Wi-Fi, use `npm run start:lan` and the computer's network address.

On a Mac, `npm run preview:install` installs a persistent preview service. Refresh it with `npm run preview:sync`, then open the Mac's `.local` hostname on port 4173. The service stays running after the terminal closes, but the Mac needs to be awake and on the same network as the phone.

## How the app is organised

The app uses TypeScript and Astro. Pages are generated as HTML, so a history's introduction, timeline, map and references are available before JavaScript runs. Browser code adds search, date controls, comparisons and navigation between histories.

| Location | What belongs here |
| --- | --- |
| `content/histories/` | Individual historical records in Markdown |
| `content/packs/` | Groups, place associations and relationships in YAML |
| `research/` | Source passages, evidence reviews and coverage records |
| `src/pages/`, `src/layouts/`, `src/components/` | Astro pages and shared HTML |
| `src/domain/`, `src/state/` | History calculations, focus changes and bookmarks |
| `src/browser/`, `src/controllers/` | Browser interactions |
| `src/presentation/`, `src/content/` | Rendering, validation and data preparation |
| `src/entrypoints/` | Browser startup modules |
| `web/` | Shared styles, assets and generated site files |
| `scripts/`, `tests/` | Building, checking, previewing and packaging the site |

Edit application code in `src/`. `npm run build:client` compiles it into `web/generated/`. Build scripts and tests also use TypeScript, run directly by Node 26. Generated JavaScript, type declarations, pages and data are ignored by Git; change their source files rather than editing the output.

Historical content lives in separate records and source packs. Start with the [content authoring guide](content/README.md) and [evidence format](research/evidence/FORMAT.md). Validation catches structural problems and broken references, but it doesn't establish whether a historical claim is correct. That still needs research.

## Build and check

```sh
npm run typecheck         # compile browser code and check build tools
npm test                  # build the site and run data, page and app checks
npm run preview:sync      # refresh the persistent preview
npm run build:pages       # prepare and verify a standalone staging package
```

Build commands don't publish anything. The staging package is written to `release/pages-site/`.

Incremental builds reuse pages whose inputs and output haven't changed. Shared code changes need broader checks because they can affect many pages. GitHub CI checks each PR once. After merge it reuses the verified package when the source tree matches, rather than rebuilding and rerunning the app tests. Sharing artwork and image URL changes use focused image and metadata checks against a verified release. Recognised internal documentation changes skip the site build; unknown files take the full verification path.

Search uses a small index. The explorer loads the history records needed for comparisons, then fetches evidence for each selected history and caches it as you move around the site.

## Appearance and analytics

The Chronology design uses shared colours and typography in `web/appearance.css`, with a logo in `src/components/Brand.astro`. The moon button switches between light and dark modes. Until you choose, the site follows your system setting; your choice is saved in your browser.

The live site uses Cloudflare Web Analytics. It doesn't use cookies. The production package includes it when built with `HISTORICA_ANALYTICS_TOKEN`; local and staging previews don't load it. It counts page visits, rather than every change to a timeline or filter, and we don't send custom search or comparison events. See the [privacy page](https://historica.online/privacy) and [release instructions](RELEASE.md).

## Contributing

Use a descriptive branch and open a PR. Main is protected. Keep related changes together and run checks appropriate to what you've changed.

Changes to design, wording or interactions need a local preview before publication. Data changes need the relevant data and source checks. The [release checklist](project/release-readiness.md) records what's still needed for the next release; [release instructions](RELEASE.md) cover packaging and recovery.

Historica was created by [Ian Sproates](https://sproates.net/). See [CONTRIBUTORS.md](CONTRIBUTORS.md) for contributor credits.

## Licence

Code is licensed under [MIT](LICENSE). Original historical summaries and research records use CC BY 4.0. Third-party material retains its own terms; see [ATTRIBUTION.md](ATTRIBUTION.md).
