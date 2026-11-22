# historica

A beta web project, intended for open-source release, for exploring world history through events, lives and places.

The current prototype has one focus at a time: person, area, state, city, period or event. The default page opens on Socrates’ lifespan. Philip II, Ptolemy I Soter, Aristotle and Egypt are clickable connections. Changing to another person fits their lifespan; changing to a place preserves the visible period. Wider, Closer and the From/To controls adjust the window without changing focus. Back restores the previous focus, window and filters.

The timeline orders context by approximate geographical distance from dated associations that overlap the context record. Areas use their own reference position. Unknown distance is explicitly shown. Timeline labels, bars and event rows change focus; separate type and area filters narrow context. Area filters use a prototype 1,200 km proximity threshold, not historical border containment.

The map highlights dated associations within the visible window; a green ring identifies a geographical focus. Gold circles are approximate reference areas, not conquered territories. Bactria retains its editorial southern-heartland outline. Philip and Ptolemy have sparse sourced place associations; unrecorded travel is not inferred from Alexander’s itinerary. Sources are available per focus and place association.

The earlier timeline/campaign interface remains at `campaign.html`. The current model and interface are in `web/focus-model.js`, `web/focus-app.js` and `web/focus.css`. Shared URLs preserve the focus, time range, filters, map camera, border fade, expanded context list, source-panel state and timeline slider bounds. Focus navigation history is retained for the current page session.

## Run locally

Run `npm start`, then open http://127.0.0.1:4173. Python 3 and Node.js are used for the development commands; no npm dependencies or API keys are required. The server serves only `web/` and binds to your own machine. Stop it with Ctrl+C.

To open historica from another device on the same Wi-Fi, use `npm run start:lan` instead. Find this Mac’s Wi-Fi address with `ipconfig getifaddr en0`, then open `http://<that-address>:4173` on the other device. This mode serves the prototype on the local network.

Run `npm test` to check historical-year selection, follow/explore behaviour, interval overlap, viewport filtering, shared state, map projection and source references.

Map data is stored in `web/data/`, with its source URLs and retrieval hashes recorded in `map-sources.json`. Event data lives in `web/data/collection.json`. The original research fixture remains unchanged.

## Research and design

- [Worldwide coverage programme](research/programme/PLAN.md)
- [Research coverage queue](research/programme/coverage.json)
- [Automated batch specification](research/programme/batch-spec.json)
- [Original prototype plan](PLAN.md)
- [First content pack: Alexander in Bactria](research/bactria.md)
- [Proposed screen and interactions](design/bactria-screen.md)
- [Screen wireframe](design/bactria-wireframe.svg)
- [Initial data fixture](research/bactria-seed.json)
- [Downloaded source provenance](research/sources/manifest.json)

The original wireframe’s map shapes are schematic. The working prototype now includes a separately documented, approximate heartland sketch; a reviewed political frontier remains to be sourced. Code uses MIT; original content uses CC BY 4.0. See [attribution](ATTRIBUTION.md) for third-party exceptions.

Campaign connections are schematic links between approximate reference points, not reconstructed roads or conquered territory. Other regions use explicitly labelled period context, not invented annual events. See [campaign research notes](research/alexander-world.md).

The focus prototype now includes an expanded 400–250 BCE collection in
`web/world-collection.js`: 68 total entities, regional browsing, contemporary
people on the timeline, and source links on each focus. Regions preserve the
visible dates. The initial timeline lists 18 matching entries; Show all reveals
the rest. Coordinates are editorial references and the collection remains
uneven, particularly outside Eurasia. Archaeological and uncertain life dates
are labelled in the focus notes. Run `npm test` for data integrity, date-window,
filter and navigation checks.

## Repository and release direction

The product is **historica**, previously called Timeline. The repository is
[github.com/sproates/historica](https://github.com/sproates/historica) and stays
private. The planned public address is
**historica.online**, registered with GoDaddy. The site will be published on A Small Orange hosting, while the repository
remains private.
Hosting and DNS are not configured by this change.

Builds and verification run manually on the Mac. Do not add GitHub Actions or
CI workflows at this stage. Run `npm run build:site` to generate the evidence and coverage assets, run
tests and package `docs/` for static hosting. Check the browser
flows before publishing. See [manual release instructions](RELEASE.md). Keep the beta label visible during this phase.

## Bookmark URLs

The root opens Socrates at `/person/socrates`. Every focus has a proper path,
such as `/person/alexander`, `/area/egypt` or `/event/socrates-trial`.
Only changed settings appear in the query string: for example,
`/area/egypt?from=-356&to=-323` keeps Alexander’s lifespan while viewing Egypt.
Default filters, world-map position and collapsed panels add nothing to URLs.
Custom dates, filters, map position, border opacity and expanded panels remain
bookmarkable. Browser Back and Forward navigate focus changes. Old fragment
links are read and replaced with the corresponding canonical path.

`build-routes.mjs` generates explicit routes for the collection into a scoped
Apache `.htaccess`; unrecognised paths and missing assets remain 404s. The
local preview server supports the same routes. The app loads assets from the
site root so direct visits and reloads work at nested URLs.

## Evidence foundation

The [claim and evidence format](research/evidence/FORMAT.md) and
[draft pilot fixtures](research/evidence/pilot.json) establish the first local
research validation step. Run `npm run validate:research` to check drafts.
`node scripts/validate-evidence.mjs path/to/package.json --release` rejects
non-accepted claims and accounts. Source-content review is still required;
the current app data has not yet been migrated or accepted under this process.

The evidence audit has started. `npm run audit:prototype` regenerates a field
inventory of the current prototype without accepting any claims. Review
findings live in `research/evidence/audit/findings.json`. Four individually
reviewed statements are in `research/evidence/socrates-reviewed.json`.
Run `npm run build:evidence` manually to validate that accepted package and
write the web asset. The source panel labels these as AI-assisted source
checks and distinguishes them from research references awaiting review.
The rest of the prototype remains unaudited; the inventory counts fields,
not atomic claims, and is not a coverage-completion metric.

### Coverage dashboard and research batches

Open `/coverage.html` (also linked from the timeline footer) to browse the worldwide queue. Workflow and evidence status have separate filters, with a pilot-only view. Selected packages and filters survive a bookmarked URL. Totals remain worldwide when filters change. The Egyptian introduction is counted separately.

Run `npm run build:coverage` after editing `research/programme/coverage.json` or the Britain/Ireland batch. This validates the registry and draft evidence, then writes the local dashboard assets. Draft findings are visible only in the research dashboard, not included in the accepted timeline evidence build.

The first manual batch, `research/batches/britain-ireland-500-251.json`, contains 13 candidate statements from six inspected sources. It records scope limitations, a chronology disagreement, and a failed source retrieval. It is not a completed regional account or an unattended research run.

To subdivide an unresearched area, supply a JSON array containing at least two children, each with a unique `id`, `name` and geographical `extent`, then run:

```sh
node scripts/split-coverage.mjs REGION children.json
npm run build:coverage
npm test
```

Parent packages remain in the registry as history. Children start unresearched; all must finish before the original parent counts as complete. The queue revision and active denominator increase, while the original 364-package denominator remains unchanged. Splitting an area with research already underway is rejected pending an explicit account migration. No actual regions have been split yet.

The timeline now reads five regional exploration entries from `web/data/reviewed-exploration.json`. From Socrates, choose **Britain and Ireland** to keep his visible dates, then explore Danebury, Broxmouth or the broader Irish Iron Age context. Each new context has visible source links and scope notes. The geographical filter uses explicit regional membership where available; it does not need an invented central map point.

`npm run build:evidence` validates and combines the Socrates and Britain/Ireland reviewed packs (17 statements), and checks the regional adapter's claim links and map-point provenance. Danebury's alternative chronologies are retained. Broxmouth's radiocarbon model probability and date ranges remain visible, and its map point is omitted pending review. Irish context is explicitly broader than Socrates' lifetime. This is partial source-backed exploration, not completed regional coverage. The 68-entity audit remains the original prototype inventory; the new entries have separate claim mappings.

A second manual batch adds Castell Henllys, the Doogarrymore wheels and Corlea construction (nine further statements; 26 reviewed statements overall). See `research/batches/britain-ireland-followup-02.json` for scope and lineage. The collection now has ten regional exploration entries. Corlea is later context, outside Socrates' lifetime and the first pilot window.

Hatched timeline bands and explicit labels distinguish uncertain dating from a continuous period of activity. Castell Henllys is shown as a possible overlap in 399 BCE; the wheels retain century precision; Corlea's construction is one year within 148–147 BCE. Map associations honour the same date envelope and explicit regional membership. No reviewed map position is invented for the wheels.

## Broad overview batch

The current collection has 100 entries and 69 source-checked statements.
The latest batch adds 21 historical entries and an editorial overview across
seven regions, with ten linked institutional sources. It prioritises breadth
over detailed accounts. Use **Ancient world · 3000 BCE–200 CE** to open the
full browsing window. Earlier predynastic context is available in Explore.
The source packs remain separate from the older prototype material awaiting
claim-level review. Coverage packages are not marked complete by this batch.

`npm run build:site` prepares the static release in `docs/`; publication is a
separate step. No CI configuration has been added.

## Search

Search history finds people, places, periods and events across all dates,
including records outside the current time window and filters. Titles rank
ahead of description matches; search ignores case and accents. Results show
type, date range and a short description. Tab and Enter select results; Escape
clears search. Place results preserve the visible dates; people and periods
fit their own dates. Search text is temporary and is not part of bookmarks.

Use `npm run package:site` to produce the static upload archive for A Small
Orange. See [release instructions](RELEASE.md). The GitHub repository remains
private; no GitHub Pages or CI setup is required.
