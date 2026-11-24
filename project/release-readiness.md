# Historica release status

Updated 24 November 2026. The sustainable application and the map/Browse homepage are live at [historica.online](https://historica.online/). There is no remaining release gate for either change.

## What is live

- Node 26, a TypeScript application and individual Markdown/YAML history records.
- Astro-generated pages for the homepage, About, privacy, research coverage and 230 histories.
- Map and Browse navigation, country and place search, grouped map markers and a draggable results sheet on phones. Browse includes entries without recorded locations.
- History timelines, related places, sources, connections and bookmarked dates. History pages can return to the originating explorer view.
- Chronology styling, a shared moon toggle and persistent light/dark appearance.
- Cloudflare analytics on production, with the map service and local preferences described in Privacy.
- A public repository, protected main and changes through PRs. Incremental verification and documentation-only checks keep routine releases short.

## Latest release

Ian approved the performance preview on 24 November. [PR #53](https://github.com/sproates/historica/pull/53) stabilises Map/Browse startup and starts the basemap independently of history data. [PR #54](https://github.com/sproates/historica/pull/54) shares world-map geometry between history pages, replaces full country geometry with a small search index and removes redirects from internal history links.

The deployed application is `ad5f3c552b33d096e3b3258abd3e112b28981e4e`. [Main verification](https://github.com/sproates/historica/actions/runs/45404855830) reused the successful PR package without rebuilding or rerunning the suite. [Production deployment](https://github.com/sproates/historica/actions/runs/45404953505) succeeded on its first attempt.

Live checks confirmed the homepage, Alexander and Britain and Ireland pages, shared SVG, country index, analytics configuration and old bookmarks with date queries. Browser checks confirmed map rendering, Browse search and country selection. Repeated production mobile Lighthouse runs returned median scores of 96 for the homepage and 100 for Alexander, compared with 53 and 67 before the changes. The [performance report](performance-improvement-plan.md) records the full measurements and limitations.

## Remaining follow-ups

- Cloudflare dashboard reporting was confirmed on 24 November. The measured loading and layout issues, sample limitations and proposed work are recorded in the [performance improvement plan](performance-improvement-plan.md).
- Keep the existing Cloudflare hosting arrangement. On 24 November Ian chose to leave the GitHub certificate setting alone. It is not pending certificate migration work; see the [hosting record](github-pages-cutover.md).
- Historica’s former ASO files and the Historica-only fallback remain available for recovery. Reclaiming that storage is a separate housekeeping action, with an off-host recovery copy retained.

## Deliberate limits

The browser loads the assembled history graph so it can compare places and dates immediately. Evidence is loaded on demand. Per-region data loading is optional future work. Customised history bookmarks can briefly show the static default while controls initialise.

The homepage uses OpenStreetMap’s standard tile service with visible attribution and normal browser caching. It is a best-effort service. The provider can be changed through configuration if traffic requires it. Browse works without loading background map tiles.

Historical coverage remains uneven. Expanding it is ongoing content work, not unfinished refactoring.
