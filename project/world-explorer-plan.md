# Explore the world

Status: local prototype for review. No production change approved.

Branch: `feature/world-explorer-prototype`

## What visitors can do

Choose a country or an area on the map and see the histories we have for that place. Change the years without losing the place. Open a history, then return to the same regional view.

This gives Historica a second starting point: visitors can begin with somewhere they know, as well as a person or event.

## Where it sits

Add **Explore the world** to the main navigation and a small entry on the home page. Keep the existing history pages. The explorer is a single new page with shared place and time controls, a graphical timeline on the left and a map on the right. On a phone, Timeline and Map buttons switch views while retaining both selections.

Use `/explore/` with readable query parameters for the country, years and map view. Do not use fragments. Store selected geography separately from the camera: looking around must not silently replace the timeline. **Explore this area** explicitly applies the visible map rectangle.

Modern countries are geographic selectors, not claims about ancient borders or identity. Label them “Present-day Italy”, for example. A historical state remains a separate history record.

## Local prototype

Source: `design/world-explorer/`. The prototype uses existing history records and Natural Earth country outlines. It supports country selection, a rectangular map area, date zoom and movement, clickable timeline entries, marker identification, mobile view switching and light/dark colours. It opens on Italy, 600 BCE–200 CE, to show a populated example.

The prototype is isolated from the production build. Its TypeScript was checked, and desktop and phone-width browser checks covered country selection, time zoom, applying an area, marker identification and switching views. Touch gestures are implemented but still need checking on a physical phone.

Location matching is deliberately provisional. It uses dated associations overlapping the selected period, falling back to an entry's reference point. A reference point is not evidence that somebody remained there throughout their life. The displayed bars describe the history's dates, not residence. The production implementation must make that distinction explicit.

## Build as one coherent feature

1. **Define geographic matching.** Create a small generated location index from existing entities and associations. Preserve location source, association dates and uncertainty. Do not fall back to a timeless reference point when dated evidence contradicts presence in the selected period. Clearly separate contextual reference matches from dated matches. Missing locations mean incomplete coverage, not an absence of history.
2. **Integrate the explorer.** Add an Astro page using existing layout, theme, map gestures, timeline and marker preview components. Reuse the prototype's interaction decisions rather than shipping its standalone renderer. Load country geometry only when needed. Keep selection, dates and camera independent, and derive map markers and timeline results from the same query.
3. **Complete navigation.** Add the navigation and home links. Preserve regional state in bookmarkable URLs, support browser Back, and provide a return-to-explorer link from a history opened through the explorer. Validate URL parameters and constrain map/time bounds. Use ordinary accessible links for histories.
4. **Verify and preview.** Check the geographic and date boundaries with targeted tests, then exercise the main desktop/mobile journeys. Refresh the existing Wi-Fi preview for review. After approval, use the normal PR and release process.

Aim for one feature PR once the prototype direction is agreed. Split only if the geographic index needs an independently useful change. No wider restyle, framework migration or new deployment tooling is needed.

## Details that need care

- Support multipolygons, holes and the antimeridian. Version the country boundary source and retain its attribution. Do not invent memberships for disputed or unlocated records.
- Fit the map to the selected geography sensibly, including countries with remote territories. Panning and zooming must remain independent of the chosen geography.
- Show full record dates alongside clipped timeline bars. Show dated geographic association intervals separately where needed, so a lifespan bar cannot be mistaken for continuous presence.
- Keep the country selector usable without the map. Provide keyboard equivalents, visible focus, named controls and stable focus when switching phone views. Identify markers before navigation on touch devices.
- Group or limit crowded timelines without hiding the existence of further results. Avoid a full page-height lane for every record.
- Use the existing no-year-zero date utilities. Derive supported date limits from the collection rather than the prototype's fixed bounds.
- Avoid repeated scans of every association on each drag. Generate an index, update results only when geography or time changes, and load large map assets once.

## Acceptance checks

- Select Italy, then Egypt: the years stay unchanged and both results and highlight update.
- Pan away from Egypt: its timeline stays selected. Apply **Explore this area**: the selected rectangle becomes the geographic filter.
- Zoom or move the time window: results and dated markers update together, including across BCE/CE.
- Tap a marker: its name appears before any navigation. Open a history and return to the same geography, dates and map view.
- Reload or share the explorer URL: the same state is restored.
- Select an area without matches: show a useful coverage explanation and ways to broaden the search.
- Complete these flows using the keyboard and a phone, in light and dark modes, without horizontal page overflow.

## Outside this first release

Drawing arbitrary shapes, reconstructing changing ancient borders, comprehensive new historical research and global coverage are separate work. This feature should expose and navigate the evidence we already have without suggesting that it is complete.
