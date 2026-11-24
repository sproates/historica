# Explore the world

Status: second local prototype, awaiting phone review. Nothing published.

Branch: `feature/world-explorer-prototype`

## The experience

Move around a map, see which histories are available, and tap a place to read them. Time is a shared filter. The map and timeline stay together.

The first prototype made visitors manage a selected country, a map rectangle and separate mobile views. It also used custom gesture handling that felt poor on a phone. The revised prototype replaces that interaction with Leaflet's map controls and a sliding results panel.

## Prototype behaviour

- The map fills the available screen, with search and a compact date button above it. Country names come from the modern basemap.
- Panning has momentum. Pinch zoom, double-tap zoom, keyboard movement and map recovery controls come from or work with Leaflet.
- Results update when map movement settles. There is no “apply this area” step.
- Numbered markers show the number of histories at a place or nearby group. Tapping reveals the complete group in the panel. Zooming separates nearby places; histories at identical coordinates remain together.
- The mobile panel has three heights: a compact summary, a reading preview and an expanded timeline. It can be dragged or controlled with buttons. On desktop it is a side panel.
- Search finds present-day countries and historical places from the existing collection. Country search frames its main geographic component. It does not impose today's political identity on historical records.
- Date controls offer presets, direct BCE/CE input and wider/closer periods. Invalid ranges and year zero are rejected.
- URLs preserve map position, dates and selected place keys. Existing history links open normally; browser Back returns to the explorer.
- Light and dark modes remain available. The prototype uses a filtered raster basemap in dark mode.

## Where it sits in Historica

Make the map the home page at `/`, opening around the Mediterranean and neighbouring regions with the results panel partly open. Keep the introduction and usage guide in About, with a dismissible first-visit hint on the map. Existing history pages retain their own focus; the explorer provides another route into them, with a visible return link preserving the geographic context.

Keep the Chronology typography and colours. This is an interaction change, not a site-wide restyle.

## Implementation after prototype approval

Deliver one coherent feature PR unless an independently useful data change needs to be separated.

1. Integrate the agreed layout into Astro with shared branding, theme, date utilities and entry links. Keep the map library out of pages that do not need it.
2. Generate a geographic index retaining source, association dates and uncertainty. Distinguish dated association matches from reference locations. Do not infer residence, territorial extent or complete coverage from a point. Do not substitute a timeless reference point when dated associations fail to match the requested years.
3. Promote the map, clustering, search and panel controls into tested components. Keep map rendering smooth by querying only when movement ends. Preserve results while the panel changes height. Handle overlapping markers, antimeridian geography and countries with remote territories explicitly.
4. Complete state restoration, including the return-to-searched-place shortcut after reload, browser Back/Forward within exploration, and returning from a history page. Add country-filtering only if it is clearly distinguished from browsing the visible map area.
5. Select an appropriate production basemap service and review its attribution, usage limits and privacy implications. The local prototype uses OpenStreetMap tiles with normal caching; this is not a production capacity decision. Provide an intentional dark basemap rather than relying on the prototype's colour filter.
6. Preview the integrated version, obtain approval, then use the normal PR/release workflow. No live changes from this local prototype branch.

## Acceptance checks

- On a physical iPhone, pan with one finger, release with momentum, pinch around a chosen point and double-tap to zoom. The page itself must not move or capture the gesture unexpectedly.
- Drag the result panel through its heights. Scroll a long list without moving the map; return to the map without losing the selected place.
- Open Stonehenge: all four mapped entries are available together. Opening a cluster must never hide the records behind its topmost marker.
- Browse away: the results update automatically and stop describing the previous selected place.
- Search France: the camera frames metropolitan France. Search Egypt: return controls recover Egypt after exploring elsewhere.
- Choose a time range with no records: explain the gap and offer another period or place. Never suggest that no historical activity occurred.
- Use the explorer with a keyboard, enlarged text, reduced motion, and light/dark themes. Credits and essential controls remain visible around the panel and phone safe areas.
- Reload and share a URL, open a history and return. Retain the intended map/time/place state.
- Handle failed history loads and failed map tiles visibly. Never leave an unexplained blank map or spinner.

## Verification

The prototype's strict TypeScript build passes. Five targeted data tests cover four shared Stonehenge entries, date filtering, avoiding timeless fallbacks for dated travel evidence, deduplication and BCE/CE arithmetic. Browser checks cover desktop/390px layouts, clustered entry selection, place search, panel expansion, map movement, date filtering and tile loading. Physical-phone gesture feel remains a review item, not a claim established by browser automation.

## Outside this release

New global historical coverage, reconstructed ancient borders, user-drawn polygons and unrelated site refactoring. The feature should make the existing collection easy to explore without overstating what it knows.

## Homepage prototype

The local preview now serves the map at `/`, uses the Mediterranean opening bounds, includes an About link and the existing source/privacy/GitHub links, and adds a return-to-map link to generated history pages. The return journey restores map position and dates. These changes are confined to the persistent preview by the prototype refresh script; production page source and live hosting are untouched.

## Browse alongside the map

The local homepage now has Map and Browse navigation. Browse searches every record, including those without locations, and offers people, places/states, periods and events. It searches all dates by default, with an explicit option to restrict results to the shared date window. Alexander, Socrates, Caesar, Stonehenge and early Egypt provide direct starting points. History pages return to the originating view with its search retained. Map position and dates are preserved when changing views. Production integration should retain this equally usable route through the collection.

## Production integration — 24 November 2026

The approved Map/Browse homepage now runs in Astro. Leaflet is bundled locally and only the homepage loads it. Browse includes generated links to all histories before JavaScript runs. The existing theme control is shared, and history pages return to the originating map or Browse search. The geographic model uses the existing dated associations and reference points; it does not need a second content index.

The initial release uses OpenStreetMap standard tiles under its normal interactive-use policy, with visible attribution, normal browser caching and no prefetch or offline downloads. It is a best-effort service without a capacity guarantee. The provider is configured in `web/data/map-service.json` so it can be replaced if traffic requires it. Privacy describes the external tile requests. Browse does not load background tiles. The approved dark-mode colour treatment remains for this release; a dedicated dark basemap is not a release requirement.

Verification covers geographic grouping, dates, mainland and date-line framing, safe return URLs, generated pages and the portable release package. Local browser checks cover Browse search, return links, map selection and mobile panel behaviour. The prototype has also been reviewed on Ian’s phone. Production integration is prepared on the feature branch; merging and deployment remain separate release actions.
