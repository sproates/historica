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
