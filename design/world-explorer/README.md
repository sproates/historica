# World explorer prototype

Local branch: `feature/world-explorer-prototype`. This is an interaction prototype, outside the production build.

Open http://ians-macbook-pro.local:4173/ on the Mac or a phone on the same Wi-Fi. The Mac must stay awake. The existing preview service runs independently of the agent session.

## What to try

- Drag and pinch the map. Leaflet supplies touch zoom and inertial panning. Results update after movement settles.
- Tap a numbered marker. The panel shows every entry at that location or nearby cluster, without navigating away.
- Drag the panel's handle up to read the timeline, or down for more map. The text button provides the same interaction without dragging.
- Search for Stonehenge, Egypt or France. Country searches frame the main component containing Natural Earth's label point, rather than remote territories. Historical places outside the active period explicitly say so; selecting one restores all dates.
- Change dates, zoom the period, explore the world, and return to the most recent searched place using the crosshair button.
- Open an entry and use browser Back. The URL retains the map, dates and selected places.

The map occupies the screen. On desktop, results sit alongside it; on mobile, they share the screen in a sliding panel. There is no apply-area action or separate map/timeline mode.

## Build and refresh

From the repository root, install the isolated prototype dependencies once:

```sh
npm ci --prefix design/world-explorer --ignore-scripts
```

Then:

```sh
python3 design/world-explorer/preview.py
node --test design/world-explorer/model.test.ts
```

The refresh compiles TypeScript, copies Leaflet and its licence to the ignored output directory, and makes the prototype the existing preview’s home page. It also adds a return-to-map link to the preview’s generated history pages and usage instructions to its About page. Content-hashed asset URLs prevent stale phone caches. This does not rebuild or publish Historica. A normal site preview sync restores the normal homepage and history pages; repeat the prototype refresh afterwards. The original preview homepage is backed up outside the served web folder.

## Data and services

History comes from the preview's existing `browser-history.json`. Natural Earth's existing country geometry supports country search. Dated location associations are filtered by the selected years. A reference point is used only for records without associations; it is not evidence of continuous residence. Multiple records at the same location share a marker. Nearby markers cluster at the current zoom, and results deduplicate histories appearing at several places.

Leaflet 1.9.4 (BSD-2-Clause) is pinned in the prototype's own lockfile. The basemap uses OpenStreetMap's standard HTTPS tiles, normal browser caching and visible attribution. It requires internet access. No tile prefetch or bulk downloads are used. Tile-server usage is limited to this small local preview; select a suitable tile service and review the privacy wording before production integration. Dark mode currently applies a colour filter to the raster map; a dedicated dark basemap is preferable for release.

Reference: https://leafletjs.com/reference-1.9.4.html and https://operations.osmfoundation.org/policies/tiles/

## Remaining limits

This is not complete geographic coverage. Point-based matching misses unlocated records and does not establish historical territories. Country search changes the camera; results include all places in its map bounds, including neighbouring countries. The result heading says “this map area” for that reason. Results include the bounds behind the sliding panel so expanding it does not change the collection being read.

Clustering is intentionally small and local to the existing collection. Production should use a spatial index as volume grows. Map position, selected results and the return-to-place shortcut are restored from the URL.

Desktop and phone-width browser checks are recorded in the plan. Physical iPhone pinch/inertia feel still requires Ian's review; browser automation cannot substitute for that.

The default opening area is the Mediterranean and neighbouring regions. A dismissible first-visit hint introduces map exploration. Existing history URLs are unchanged; a same-tab return link restores the latest map state from session storage. Production Astro source remains unchanged until the prototype is approved for integration.

## Browse without the map

Use Map / Browse beneath the header. Browse searches all entities, including records without geographic points, with type and optional date filters. The five starting journeys open existing history pages directly. The view, search and filters are bookmarkable; history pages offer Back to Browse when appropriate. Switching to Map retains its camera and dates.
