# Alexander in Bactria

Initial content feasibility pack, 22 November 2026.

Update: the working prototype now includes an [approximate editorial heartland outline](bactria-outline.md). The initial findings below remain a record of why this is not presented as an exact political border.

We have enough evidence to begin a focused prototype around Alexander's arrival in Bactria in 329 BCE. We have identified reusable modern mapping and an ancient-place gazetteer. A defensible historical outline remains an explicit research task.

## Content for the first scene

| Record | Proposed short copy | Evidence and precision |
| --- | --- | --- |
| Alexander enters Bactria | Alexander invaded Bactria in spring 329 BCE while pursuing Bessos. | Michael Weiskopf, [Bessos, Encyclopaedia Iranica](https://www.iranicaonline.org/articles/bessos-satrap-of-bactria/), passage citing Arrian 3.28–29. Seasonal precision; no invented day or month. |
| Bactra | Bactra, associated with modern Balkh, was Bessos' capital. It fell during Alexander's invasion. | Same article, passages on the capital and invasion. A city's capture is not evidence of Alexander's precise location throughout the year. |
| Bactria | An ancient region to explore in relation to Bactra and surrounding places. | [Pleiades 971705](https://pleiades.stoa.org/places/971705). Region identity is supported; a dated outline is not supplied by this record. |
| Campaign context | The wider Central Asian campaign provides a 329–327 BCE exploration window. | Michele Minardi, [The Northeastern Regions of the Persian Empire](https://academic.oup.com/book/45753/chapter/398242062), published 2023, abstract. This is a browsing window, not a continuous location claim. |

The first selected event should be “Alexander enters Bactria”, with the displayed date “Spring 329 BCE”. The map should locate the region and Bactra without presenting a continuously tracked Alexander marker. Exact itinerary, age and further stops need their own sourced records before display.

## Map evidence and reuse

### Ancient places

Pleiades publishes reusable place records under [CC BY 3.0](https://pleiades.stoa.org/help). Its [download documentation](https://pleiades.stoa.org/downloads) identifies JSON as the complete export format. Two unmodified records have been saved under `sources/`, with retrieval details and hashes in `sources/manifest.json`.

- **Bactria, 971705:** the inspected export has an empty `locations` array. Its representative point and bounding box are not a regional boundary and must not be rendered as one.
- **Bactra/Zariaspa, 961886:** identifies the ancient city with modern Balkh. Its location geometry is an OpenStreetMap-derived LineString, rather than an outline of Bactria or a location observation of Alexander. Keep the upstream provenance. Review the OSM-derived component's terms before shipping it as application geometry.

Retain creators, contributors, source identifiers and licence links in any derived dataset. The two raw exports are research inputs; they have not been promoted to production map data.

### Modern borders

Use [Natural Earth Admin 0 countries at 1:50 million](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/) as the first candidate. The inspected page lists version 5.1.1. Its [terms](https://www.naturalearthdata.com/about/terms-of-use/) place its map data in the public domain. Its default boundary treatment is de facto. Record the chosen version and boundary treatment when importing it.

This is suitable for regional orientation, not detailed street mapping. Keep present-day labels in a separate layer from historical names. The comparison control changes opacity, not the historical date, camera position or historical area's visibility.

### Historical extent

No usable, period-specific Bactria polygon has been verified in this pass. The Pleiades record points to B. Lyonnet, “The Problem of the Frontiers between Bactria and Sogdiana: An Old Discussion and New Data”, 1993, pp. 195–208, and the Barrington Atlas, map 99 B2. These are research leads, not reviewed evidence or permission to trace a map.

Next, inspect those boundary studies and seek explicitly reusable geometry for the relevant period. If an editorial reconstruction is necessary, document the geographical evidence, interpretation, date coverage and reuse basis. Have it reviewed before presenting it as historical content. Never substitute the later Greco-Bactrian kingdom for Alexander-era Bactria.

Until then, the working map can show named places and a clear “Historical outline not yet available” state. The wireframe uses an explicitly schematic shape only to demonstrate the proposed visual treatment.

## Proposed data conventions

The accompanying `bactria-seed.json` is a small design fixture, not a complete historical database.

- Store years as a positive number plus BCE/CE. Do not use JavaScript dates to represent historical years.
- Keep season, date precision and event duration distinct. Spring 329 BCE is not an exact date or a year-long event.
- Separate a place's geometry from a person's presence there. Attach evidence to each claim.
- Use `null` plus a reason for missing geometry. Do not fabricate coordinates to complete the schema.
- Keep the collection's browsing window separate from the period for which any historical boundary is valid.

## Prototype acceptance checks

1. The opening scene identifies Bactria as a region and Bactra as a city.
2. Selecting the arrival event shows “Spring 329 BCE” and opens its supporting source.
3. The comparison slider changes only modern borders and labels. Historical context remains visible at both endpoints.
4. No precise Alexander location or continuous route appears without a dated supporting observation.
5. Missing historical geometry has an explicit state; a bounding box never becomes a historical outline.
6. Keyboard buttons provide alternatives to timeline dragging, with a text list of the same events.

## Next implementation work

Build the linked date selection, information panel and modern-border control using these fixtures. Keep the missing historical-outline state until the geometry research is resolved. The visual interaction can be evaluated independently, but the Bactria comparison scenario is not historically complete until it includes a reviewed outline.
