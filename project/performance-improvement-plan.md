# Performance review and improvement plan

24 November 2026. This review combines Lighthouse measurements of the live site, Cloudflare Web Analytics and inspection of the code that produced the release. No application, analytics or hosting settings were changed.

The immediate problems are homepage layout movement and unnecessary map data on the loading path. JavaScript execution is comparatively cheap. We should fix those loading behaviours and reduce geographic payloads before considering broader architectural changes.

## Measurement scope

Lighthouse 13.6.0 ran locally against production using a separate headless Chrome 158 session for each audit. Tests ran sequentially, with normal Lighthouse storage reset and simulated throttling. Mobile settings were a 412 × 823 viewport, 150 ms simulated RTT, 1,638.4 Kbit/s throughput and a 4× CPU slowdown. Desktop used Lighthouse's desktop preset. These are laboratory conditions, not measurements from an actual slow phone.

The map homepage and Alexander route each received three mobile runs. Desktop versions and the Browse URL received one diagnostic run each. This is nine audits, not a whole-site crawl. Lighthouse performance scores can vary between runs; the table reports medians for repeated tests and exposes the observed range. [Lighthouse measurement guidance](https://developer.chrome.com/docs/devtools/lighthouse), [variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md).

The live application is the map/Browse release deployed at approximately 08:51 CET on 24 November. The later housekeeping and architecture-documentation merges had not been deployed. Local source inspection focused on the application paths unchanged by those merges.

Raw HTML/JSON reports, a machine-readable summary and Cloudflare snapshots are retained locally in ignored `release/performance-2026-11-24/`. They are not part of the public site. The first Lighthouse audit started at 12:14:48 CET. The post-release field window below ends before that, so these audit sessions cannot contaminate it.

## Lighthouse results

FCP is the first contentful paint; LCP is when the largest visible content appears. CLS measures unexpected layout movement. TBT measures blocked main-thread time during loading, not responsiveness throughout a visitor's session.

| Page and device | Runs | Performance score | FCP | LCP | CLS | TBT | Transferred |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Map homepage, mobile | 3 | **53** (53–74) | 1.32 s | **6.58 s** | **0.785** | 16 ms | 1,001 KiB |
| Alexander, mobile | 3 | **67** (65–67) | **5.28 s** | **5.28 s** | 0 | 0 ms | 1,028 KiB |
| Map homepage, desktop | 1 | 70 | 0.48 s | 1.77 s | **0.576** | 0 ms | 1,800 KiB |
| Alexander, desktop | 1 | 94 | 1.20 s | 1.20 s | 0 | 0 ms | 1,028 KiB |
| Browse homepage, mobile | 1 | 76 | 1.27 s | 1.27 s | **0.787** | 0 ms | 952 KiB |

Each column in a repeated row is its own median, rather than a single selected run. Mobile homepage LCP ranged from 6.56 to 7.14 seconds and CLS from 0.067 to 0.787. Alexander LCP ranged from 5.24 to 5.58 seconds. No Lighthouse run warnings were reported.

The homepage's desktop transfer is larger because that viewport requests more map tiles. Browse requests no background tiles, but still downloads the large country geometry file. Alexander was requested at `/person/alexander`, matching the site's links; GitHub redirects that to `/person/alexander/` before serving the page.

## Cloudflare evidence

The initial dashboard snapshot showed 47 page views and 36 visits over the preceding 24 hours, with analytics installed about 17 hours earlier. That window spans both the previous homepage and the map release, so its aggregate results shouldn't be used as the new homepage's baseline. Bot exclusion was enabled, but our own ordinary browsing and preview-of-production sessions can still be included.

In that mixed window, Cloudflare reported LCP p75 of 641 ms, 98% good LCP, 93% good INP and 57% good CLS. The page-load report showed p75 of 927 ms and a redirect component of 261 ms. Its sample was predominantly Gibraltar traffic. Those figures describe a small, local and potentially repeat-visitor sample, not the wider audience on slower networks. The page-load report subsequently contained 48 measurements; dashboard panels refreshed independently.

To isolate the current release, the Core Web Vitals report was filtered to **24 November, 09:00–12:00 CET** (08:00–11:00 UTC), Historica only, excluding bots. All recorded URL groups in this window were the homepage.

| Metric | Post-release observations | What they tell us |
| --- | --- | --- |
| LCP | 6 observations: 5 good, 1 poor. p50 288 ms, p75 **1,808 ms**, p90 5,468 ms | Usually quick in this small sample, with one slow map-tile paint |
| INP | 5 observations, all good | No demonstrated widespread interaction problem; too little data to declare it solved |
| CLS | 5 observations: 3 good, **2 poor** | Both poor observations identify `#browse`, with debug-view p75 **0.416** |

The slow LCP debug entry is an OpenStreetMap tile, at 5,468 ms. Cloudflare's p75 subparts show a 1,007 ms resource-load delay, versus 123 ms resource-load duration. The independently aggregated subparts should not be added together as if they described one exact page load.

This makes the field evidence useful for identifying the problem, but not for estimating how often it affects the wider audience. Six LCP observations aren't six independently verified people, and five CLS measurements aren't a population-level failure rate. There are no post-release history-page observations in this window to compare with Alexander's lab results. [Cloudflare Core Web Vitals documentation](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/).

## Findings and causes

### 1. Startup changes the visible page after it has painted

**Measured:** Lighthouse attributes the largest shifts to `main#browse`: approximately 0.545 on desktop and 0.785 in the mobile Browse run. Cloudflare independently identifies the same element in both poor post-release CLS observations.

**Code evidence:** `src/pages/index.astro` initially serves Browse as visible and the map as hidden. `src/explorer/app.ts` then unhides the map before data has loaded, and only applies the requested Map/Browse state after the history and geography requests complete. In Browse, it also replaces the generated list with a differently shaped list containing descriptions and a 24-entry limit.

**Conclusion:** the measured shifts and startup sequence agree. The issue is not merely an unreliable Lighthouse score. We need the initial layout to match the requested view before the first paint, while retaining a useful no-JavaScript fallback.

### 2. The map background waits for unrelated data

**Measured:** the country GeoJSON transfers about **815 KiB**, roughly 81% of the mobile map homepage's total transfer. It also loads in Browse. The history graph is only about **49 KiB transferred**. In Lighthouse, the LCP element is a map tile discovered after the application's loading chain.

**Code evidence:** the homepage waits for both history and full country geometry in `Promise.all`, then switches view, fetches `map-service.json` and creates the tile layer. The country geometry is needed for country framing, not to display the initial background or search historical entries.

**Conclusion:** start independent work independently. Removing full geometry from the critical path should bring the map forward without replacing Leaflet or moving hosts. Smaller geometry will also reduce transfer and parsing costs; the precise time saving needs a before/after measurement.

### 3. Detailed world geometry dominates every history document

**Measured:** Alexander's document transfers about **883 KiB**, with approximately **2.47 MB of decoded HTML**. Source-output inspection finds **2.40 MB of inline SVG**, about 97% of that document. The history graph is a much smaller additional request. Mobile first paint is slow, while measured blocking time is 0–12 ms.

**Code evidence:** `src/presentation/history-page.ts` projects the full modern-country geometry into SVG paths for each static page, preserving unrounded projected coordinate values. The browser reuses these inline paths through `src/presentation/map-data.ts`.

**Conclusion:** the static HTML is carrying far more map detail than an initial related-places view needs. Reduce the paths and make detailed geometry reusable without losing an initial static map or the highlighted historical places. Splitting the historical records into another database wouldn't address this bottleneck.

### 4. Internal links incur a directory redirect

**Measured:** `/person/alexander` returns a 301 to `/person/alexander/`. Lighthouse estimates approximately 1.03 seconds of redirect cost in the first mobile audit under its simulated network. Cloudflare also records redirect time in the mixed field sample, although that panel alone doesn't identify the cause of each redirect.

**Code evidence:** Astro uses directory output, while many generated links use the unsuffixed route. This is a hosting/link convention mismatch.

**Conclusion:** emit the final served path in internal links and relevant canonical metadata. Existing bookmarks should continue working. This is useful alongside the payload reduction, but it won't explain or fix the whole 5.28-second mobile paint time.

### 5. Caching is a secondary opportunity

Read-only header checks showed a 600-second lifetime for the unversioned JSON files and Cloudflare `DYNAMIC` responses. GitHub's upstream responses also showed cache hits, so `DYNAMIC` doesn't mean there is no cache anywhere. Lighthouse reported four-hour lifetimes for several JS/CSS assets.

Content-hashed assets could support longer caching, but unversioned history JSON and browser modules must remain fresh across releases. Don't apply a broad cache rule. First shrink and decouple the payloads; review versioned-asset caching afterwards if repeat-load measurements still justify it. No DNS, certificate or Cloudflare account changes are part of this plan.

## Proposed work

Deliver two coherent implementation PRs, with an approved Wi-Fi preview for visible startup changes. Avoid turning the review into a sequence of speculative optimisations.

| Order | Scope | Expected outcome | Size |
| --- | --- | --- | --- |
| 1 | Stabilise initial Map/Browse rendering; keep Browse independent of map startup; start the basemap without waiting for full country geometry; preserve static fallback and bookmarked views | Remove the demonstrated layout jump and shorten the map's loading chain | Medium, roughly 1–2 working days |
| 2 | Generate compact, appropriately rounded/simplified geography for the initial views; share or defer high-detail geometry; remove directory redirects from internal history links | Reduce homepage transfer and the oversized history HTML, with faster first paint and repeat navigation | Medium, roughly 1–2 working days |

These are implementation estimates, not measured savings or a delivery commitment. PR 1 should be measured before finalising PR 2's payload budgets. If simple coordinate rounding meets the quality and size targets, don't introduce a more complicated map format merely to use one.

### Acceptance criteria

- Homepage Map and Browse remain in the correct initial view. No flash of the other mode, including under throttling and when restoring a bookmark.
- Three consecutive mobile audits and a desktop check show CLS no higher than **0.1**. Keep the generated fallback usable without JavaScript and avoid replacing visible Browse markup with a different layout on startup.
- Browse does not request the full country geometry or map tiles. Historical search remains usable if the basemap provider or country-framing data fails.
- Map tiles start without waiting for the full history/country pair. Add local measurement marks for first usable map and populated results during verification, because a good LCP alone doesn't prove that the explorer is ready.
- Initial geography is substantially smaller. Provisional budgets: no more than **150 KiB transferred** for initial geographic data and **200 KiB transferred** for a history document. Retain high-detail geometry only where a demonstrated zoom need warrants it.
- Geography remains correct at supported zooms: check Britain and Ireland, small islands, France's mainland framing, Russia across the date line and Bactria's historical outline. Don't sacrifice recorded points or historical boundaries for a smaller modern basemap.
- Internal links reach history pages without the extra directory redirect, while old URLs and query bookmarks remain valid.
- Aim for median mobile LCP at or below **2.5 seconds**, CLS at or below **0.1**, and no regression in map gestures, search, sheet dragging or focus changes. Use actual results to revise the loading approach if the first pass misses the target.

The field targets are p75 LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1, segmented by device when there is enough data. These are Google's recommended Core Web Vitals thresholds. A Lighthouse score is supporting information, not the acceptance criterion by itself. [Web Vitals definitions and thresholds](https://web.dev/articles/vitals).

## Verification without slowing every release

Repeat the same small Lighthouse matrix before and after the two changes: three sequential mobile runs for `/` and `/person/alexander`, with single diagnostic runs for desktop and `/?view=browse`. Keep browser, Lighthouse version, throttling, viewport and first-visit conditions consistent. Also inspect the final slash URL to separate redirect savings from rendering savings.

Use a focused phone check for pan, pinch, sheet dragging, Browse search and opening/returning from a history. Navigation-mode Lighthouse doesn't measure INP or the whole interaction journey. Low TBT isn't proof that these interactions are smooth.

After publication, compare a post-release Cloudflare window with the same routes, devices and sample counts. Review after seven days, but if traffic is still sparse, say so rather than treating unstable percentiles as proof. Keep an eye on the specific `#browse` shift and late map-tile LCP observations. Analytics is confirmed to be collecting real measurements; no additional analytics product is needed for this work.

Don't add Lighthouse to every PR as part of this plan. Run it for these performance changes and relevant future regressions. Cheap output-size checks can protect the geography and document budgets in existing verification, while documentation-only changes keep their fast path.

## Reproducing the lab audit

Run from the repository on a machine with Chrome installed. Reports belong in ignored `release/`, not in the published site. This command uses the measured Lighthouse version without adding a project dependency:

```sh
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse https://historica.online/ \
  --only-categories=performance --chrome-flags='--headless --no-first-run' \
  --output=json --output=html --output-path=release/performance/home-mobile
```

Use `--preset=desktop` for desktop. Run audits sequentially so they don't compete for CPU. Preserve each repeat's report rather than overwriting it.

## Startup implementation preview, 24 November

The first part is implemented on `perf/explorer-startup` and available on the persistent Wi-Fi preview. It hasn't been published. The requested Map or Browse layout is selected before the body paints. Browse's generated entries now include the same summaries as the interactive list, while the complete collection remains available without JavaScript.

The basemap and history requests start independently. Country geometry is fetched when country search is opened, or when restoring an old country-only bookmark. Browse doesn't initialise the map camera or fetch tiles or country geometry. A country-data failure no longer rejects the history request. Saved filters, map framing and the mobile sheet were checked in the browser, in light and dark modes.

### Preview measurements

The same Lighthouse version and simulated device settings were used against the Wi-Fi preview. This is a different server from production: it serves uncompressed local files and has different connection latency. These results verify layout stability and request behaviour; they aren't a forecast of production LCP or transfer size.

| Preview | Runs | CLS | LCP |
| --- | ---: | ---: | ---: |
| Map, mobile | 3, final build | 0.074 in every run | Approximately 4.2 s |
| Map, desktop | 1 | 0.031 | 0.94 s |
| Browse, mobile | 3 | 0 in every run | Median 1.35 s; range 1.35–2.30 s |
| Browse, desktop | 1 | 0 | 0.36 s |

Browse request lists contain neither country geometry nor tiles. Normal map entry also avoids country geometry. The large country file is still used for country search; shrinking it and the inline geography on history pages remains the second part of this plan.

The application records `historica-map-first-tile`, `historica-map-results-ready` and `historica-browse-ready` performance marks. The first marks a successful tile load, not complete map coverage. Lighthouse reports retain the marks, but their observed local timings mustn't be compared directly with simulated LCP.

Reports and the mobile preview screenshot are in ignored `release/performance-2026-11-24/startup/`. The initial exploratory map run predates the final sheet-sizing adjustment; the final map mobile comparison uses runs 2–4. Targeted explorer and static-page tests pass, as does the preview build. After preview approval and release, repeat the production measurements and review Cloudflare once it has enough new observations.

## Shared-map implementation preview, 24 November

The second part is on `perf/compact-history-maps`, based on the startup branch. The Wi-Fi preview includes both changes; neither has been published.

History pages reference one content-hashed SVG for modern borders instead of embedding the world geometry in every document. It uses the same vertices and rings, with projected coordinates rounded to two decimal places. The maximum rounding error per coordinate is 0.0025 degree. Historical overlays, markers and area highlights remain in the document. The shared SVG works without JavaScript and is reused when the interactive renderer updates the map.

Country search now uses generated names and mainland bounds. The build uses the existing component-selection and date-line logic, and tests compare every generated country's bounds with the original geometry. Country geometry is no longer downloaded for search. Internal history links, bookmark output, canonical metadata and sitemap entries use the served trailing-slash path; decoding still accepts old links.

| Asset | Before, uncompressed | Preview, uncompressed | Preview gzip estimate |
| --- | ---: | ---: | ---: |
| Alexander HTML | 2,469,121 bytes | 78,845 bytes | 13,591 bytes |
| Britain and Ireland HTML | 2,515,381 bytes | 113,858 bytes | 23,457 bytes |
| Country search | 2,294,670 bytes of full geography | 24,448 bytes | 9,208 bytes |
| Shared modern borders | Embedded separately in every history page | 1,324,899 bytes, reusable SVG | 457,712 bytes |

These gzip figures are local estimates, not measured production transfers. The history-document budget is met. The provisional 150 KiB initial-geography budget isn't: the first history visit still downloads about 447 KiB of compressed world geometry. This version preserves every island and border vertex rather than introducing unverified simplification. The main improvement is that this download no longer delays the initial history text and isn't repeated as part of each page's HTML. Smaller shared geography remains an opportunity if production measurements justify it.

Three sequential mobile Lighthouse audits of the final preview's `/person/alexander/` scored 100, with LCP between 1.354 and 1.356 seconds and CLS 0 in every run. No audit warnings were reported. The local server sends uncompressed assets, and the network differs from production, so compare these with the earlier live results cautiously. Reports are retained in `release/performance-2026-11-24/compact-maps/`.

The static build checks passed for all 234 pages. Runtime and packaging tests were run; two expectations still required the old unsuffixed URL and passed after correction. Browser checks covered the shared map after zooming, Britain and Ireland's highlight, country search and Russia's framing, and the mobile map in dark mode. No production, DNS or cache configuration was changed.


## Production release and follow-up measurements

Both implementation PRs were approved and published on 24 November as `ad5f3c552b33d096e3b3258abd3e112b28981e4e`. Main verification [45404855830](https://github.com/sproates/historica/actions/runs/45404855830) reused the verified package; deployment [45404953505](https://github.com/sproates/historica/actions/runs/45404953505) succeeded without a rebuild. Earlier preview sections above describe the state before this release.

Seven sequential production mobile Lighthouse audits used the same version and simulated settings as the baseline: three homepage, three Alexander and one Browse run. There were no audit warnings. Each repeated result below is a median; ranges expose variation.

| Page | Score before → after | LCP before → after | CLS after | Transfer before → after |
| --- | --- | --- | --- | --- |
| Map homepage | 53 → **96** (94–96) | 6.58 s → **2.62 s** (2.43–3.00) | 0.015 median; 0–0.078 | 1,001 → **196 KiB** |
| Alexander | 67 → **100** (all three) | 5.28 s → **1.09 s** (1.07–1.30) | 0 in every run | 1,028 → **607 KiB** |
| Browse | 76 → **100** (one run each) | 1.27 s → **1.10 s** | 0 | 952 → **147 KiB** |

Alexander's HTML now transfers about 15.5 KiB, compared with roughly 883 KiB in the baseline. Its new audit uses the suffixed URL emitted by the application; the old audit used the unsuffixed internal-link destination. The improvement therefore includes removal of that redirect, as intended. The shared SVG remains the largest history-page asset on a first visit.

All three homepage runs met the CLS target of 0.1. Its median LCP remains slightly above 2.5 seconds, so this isn't a claim that every performance target is met. Tile-service variability and the remaining shared-map download are still worth observing, but the measured changes justify stopping this optimisation pass here.

These are same-day laboratory comparisons, not proof of real-visitor improvement. Cloudflare needs a new post-release sample before we can assess that. Audits and our live browser checks can contribute analytics observations; exclude this validation window when comparing field data. Raw reports and a JSON summary are retained in ignored `release/performance-2026-11-24/production/`.
