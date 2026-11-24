# Explore the world

Released on 24 November 2026 through [PR #48](https://github.com/sproates/historica/pull/48). Ian approved the integrated Wi-Fi preview before publication. The feature branch has been removed.

## The experience

Move around a map, see which histories are available, and tap a place to read them. Time is a shared filter. The map and timeline stay together.

The first prototype made visitors manage a selected country, a map rectangle and separate mobile views. It also used custom gesture handling that felt poor on a phone. The revised prototype replaces that interaction with Leaflet's map controls and a sliding results panel.

## Released behaviour

- The map fills the available screen, with search and a compact date button above it. Country names come from the modern basemap.
- Panning has momentum. Pinch zoom, double-tap zoom, keyboard movement and map recovery controls come from or work with Leaflet.
- Results update when map movement settles. There is no “apply this area” step.
- Numbered markers show the number of histories at a place or nearby group. Tapping reveals the complete group in the panel. Zooming separates nearby places; histories at identical coordinates remain together.
- The mobile panel has three heights: a compact summary, a reading preview and an expanded timeline. It can be dragged or controlled with buttons. On desktop it is a side panel.
- Search finds present-day countries and historical places from the existing collection. Country search frames its main geographic component. It does not impose today's political identity on historical records.
- Date controls offer presets, direct BCE/CE input and wider/closer periods. Invalid ranges and year zero are rejected.
- URLs preserve map position, dates and selected place keys. Existing history links open normally; browser Back returns to the explorer.
- Light and dark modes remain available. The map uses a filtered raster basemap in dark mode.

## Where it sits in Historica

The map is the home page at `/`, opening around the Mediterranean and neighbouring regions with the results panel partly open. The introduction and usage guide are in About, with a dismissible first-visit hint on the map. Existing history pages retain their own focus; the explorer provides another route into them, with a visible return link preserving the geographic context.

The Chronology typography and colours are retained. This is an interaction change, not a site-wide restyle.

## Browse alongside the map

The homepage has Map and Browse navigation. Browse searches every record, including those without locations, and offers people, places/states, periods and events. It searches all dates by default, with an explicit option to restrict results to the shared date window. Alexander, Socrates, Caesar, Stonehenge and early Egypt provide direct starting points. History pages return to the originating view with its search retained. Map position and dates are preserved when changing views.

## Production implementation

The approved Map/Browse homepage now runs in Astro. Leaflet is bundled locally and only the homepage loads it. Browse includes generated links to all histories before JavaScript runs. The existing theme control is shared, and history pages return to the originating map or Browse search. The geographic model uses the existing dated associations and reference points; it does not need a second content index.

The initial release uses OpenStreetMap standard tiles under its normal interactive-use policy, with visible attribution, normal browser caching and no prefetch or offline downloads. It is a best-effort service without a capacity guarantee. The provider is configured in `web/data/map-service.json` so it can be replaced if traffic requires it. Privacy describes the external tile requests. Browse does not load background tiles. The approved dark-mode colour treatment remains for this release; a dedicated dark basemap is not a release requirement.

Verification covers geographic grouping, dates, mainland and date-line framing, safe return URLs, generated pages and the portable release package. Local browser checks cover Browse search, return links, map selection and mobile panel behaviour. The prototype has also been reviewed on Ian’s phone. The approved version was merged and deployed on 24 November 2026.

## State and coverage limits

The URL retains the current map position, dates, selected places and Browse filters. A history page’s return link restores that view. Map movements replace the current URL rather than creating a separate browser Back entry for every movement.

Country search frames a country’s main component; results describe the visible map area, not an exact country-membership filter. Points show recorded locations, not historical borders or complete coverage. Dated associations take precedence over reference locations.

New global historical coverage, reconstructed ancient borders and user-drawn polygons remain outside this release.
