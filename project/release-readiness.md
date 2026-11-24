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

Ian approved the integrated preview before [PR #48](https://github.com/sproates/historica/pull/48) was merged as `2a2d53837c9bf574dd11a68de49fd5f916782df3`. [Main verification](https://github.com/sproates/historica/actions/runs/45350942545) reused the successful PR package without rebuilding or rerunning the tests.

[Production deployment](https://github.com/sproates/historica/actions/runs/45351006640) succeeded on its second attempt. The first attempt could not find the just-uploaded Pages artifact; the artifact was subsequently visible and retrying the deployment succeeded. This was a deployment lookup failure, not a build or test failure. No application change was needed.

Local verification passed 199 application tests and 15 static-page tests. The packaged release verified 230 history routes and 4,710 local links. Browser checks covered Browse search, return links, country search, grouped markers, mobile sheet dragging and dark mode. Ian also reviewed the prototype on his phone. After deployment, HTTPS checks verified the public homepage, map bundle, provider configuration, Stonehenge return link and updated privacy page.

## Remaining follow-ups

- Confirm that visits appear in the Cloudflare analytics dashboard. Loading the live beacon has been verified; dashboard reporting has not.
- Keep the existing Cloudflare hosting arrangement. On 24 November Ian chose to leave the GitHub certificate setting alone. It is not pending certificate migration work; see the [hosting record](github-pages-cutover.md).
- Historica’s former ASO files and the Historica-only fallback remain available for recovery. Reclaiming that storage is a separate housekeeping action, with an off-host recovery copy retained.

## Deliberate limits

The browser loads the assembled history graph so it can compare places and dates immediately. Evidence is loaded on demand. Per-region data loading is optional future work. Customised history bookmarks can briefly show the static default while controls initialise.

The homepage uses OpenStreetMap’s standard tile service with visible attribution and normal browser caching. It is a best-effort service. The provider can be changed through configuration if traffic requires it. Browse works without loading background map tiles.

Historical coverage remains uneven. Expanding it is ongoing content work, not unfinished refactoring.
