# Trial two handoff

## Run record

- Worker: `gpt-6-luna`, low reasoning.
- Brief: revision 3, `project/research-agent-pilot.md`; assignment `research/drafts/old-babylonian-trial-two/assignment.md`, commit `747c51c` (provided by coordinator).
- Start time: unavailable; the clock was not captured before source inspection began. First explicit clock reading during the run: 2026-11-24 15:15:13 UTC.
- Finish time: pending final validation timestamp below.
- Source pages inspected: 6 distinct pages (listed below). Two attempted coordinate pages were inaccessible (ORACC timed out; Pleiades presented a bot-check page); neither is used as evidence.
- Focused discovery searches: 3 queries total, self-reported: Samsu-iluna date/succession (1), Larsa coordinates (2). These remain within the per-item limits.
- Atomic claims: 10. Draft entries: 3. Usable for review against all required fields: 1 of 3; 2 blocked by missing required numeric Larsa coordinates (Rim-Sin I and Larsa). Reviews are empty; no claim is accepted or self-verified.
- Provider token, cached-token, output-token, and monetary-cost telemetry: unavailable. Active-work duration: unavailable; elapsed duration cannot be calculated because a start time was not captured.

## Inspected source pages

1. Elizabeth Knott, The Metropolitan Museum of Art, “The Isin-Larsa and Old Babylonian Periods (2004–1595 B.C.)”, https://www.metmuseum.org/fr/essays/the-isin-larsa-and-old-babylonian-periods-2004-1595-b-c. Inspected paragraphs on Larsa, Rim-Sin, Hammurabi and the period span.
2. French Ministry of Culture, “L’apogée de la ville”, https://archeologie.culture.gouv.fr/larsa/fr/lapogee-de-la-ville. Inspected the “Le triomphe de Larsa” and “La chute” sections for Rim-Sin dates, Larsa, and Hammurabi’s taking of the city.
3. French Ministry of Culture, “Tell es Senkereh”, https://archeologie.culture.gouv.fr/larsa/fr/tell-es-senkereh-1. Inspected identification and “Localisation”; it locates the site relatively but gives no numeric coordinates.
4. French Ministry of Culture, “La plaine alluviale mésopotamienne”, https://archeologie.culture.gouv.fr/larsa/fr/la-plaine-alluviale-mesopotamienne. Inspected the opening identification and setting between the Tigris and Euphrates.
5. UNESCO World Heritage Centre, “Babylon”, https://whc.unesco.org/en/list/278/. Inspected the site description and coordinates `N32 32 31.09 E44 25 15`; converted to longitude/latitude decimal degrees for a site reference.
6. Dominique Charpin, Collège de France, “Mesopotamia under Hammu-rabi’s successors”, https://www.college-de-france.fr/en/agenda/lecture/mesopotamia-under-hammu-rabi-successors. Inspected opening paragraph and chronology note; the page gives Samsu-iluna’s 1749–1712 dates and identifies him among Hammu-rabi’s successors. The page notes its English version is automatically translated.

## Completion and blockers

| Candidate | Date basis | Map basis | Connections and dependencies | Completion | Remaining work |
| --- | --- | --- | --- | --- | --- |
| `samsu-iluna-reign` | Approximate reign endpoints, average chronology, not lifespan | Babylon reference coordinates from UNESCO, explicitly not residence/presence | Supported succession edge to existing `hammurabi-reign`; Babylon is an existing ID checked in the assignment inventory. Babylon-rule connection remains insufficiently direct. | Draft; one required map reference present; rule connection unresolved | Inspect an appropriate direct source stating Samsu-iluna’s rule of Babylon. |
| `rim-sin-one-reign` | Approximate reign endpoints in French Ministry source; Rim-Sin I identified by Larsa and period context, not Rim-Sin II | Required Larsa point absent | Rule of Larsa and political conflict with Hammurabi supported; dependencies `larsa` and `hammurabi-reign` are assigned/existing IDs. | Blocked | Inspect a coordinate source and confirm its point matches Tell es Senkereh. |
| `larsa` | Editorial study window aligned to Met period title 2004–1595 BCE; not city lifespan | Required Larsa point absent | Rim-Sin I relationship supported; endpoint exists as assigned draft. | Blocked | Inspect a coordinate source; ensure study-window wording remains clearly editorial. |

### Metadata mapping

| Candidate | Title / date / date note | Point / region | Notes |
| --- | --- | --- | --- |
| `samsu-iluna-reign` | `samsu-iluna-dates`; succession context `samsu-iluna-succession` | Point: `samsu-iluna-babylon-point`; region: same geographic reference, Babylon | Point means site reference only. It does not satisfy the independent rule-of-Babylon claim. |
| `rim-sin-one-reign` | `rim-sin-dates`; title identification and date note use the same context | Point: null; region: `rim-sin-rule-larsa` | Point and association omitted because no coordinates were inspected. |
| `larsa` | `larsa-period-window`; title/site identification `larsa-site-identification`; date note is explicitly editorial | Region: `larsa-geography`; point: null | Study window is not an asserted occupation span. |

### Dependencies checked

- Existing IDs from assignment inventory: `hammurabi-reign` (period) and `babylon` (city). `middle-kingdom-egypt` and `indus-urban` were not altered or used to imply contact.
- Assigned draft dependency: `larsa` (city). Assigned draft relationship target: `rim-sin-one-reign` (period).
- No further dependencies introduced.

The assignment’s comparison ranges are Middle Kingdom Egypt −2055 to −1650 and Indus urban −2600 to −1900. The Samsu-iluna interval −1749 to −1712 overlaps the Egypt range by 37 years (the common interval is −1749 to −1712), and does not overlap Indus urban. The Rim-Sin I interval −1822 to −1763 overlaps Egypt by 59 years (−1822 to −1763), and does not overlap Indus urban (the nearest endpoints are −1900 and −1822, a 78-year gap between boundary years). These are interval arithmetic only, not evidence of contact.

## Validation and bounded check

- Draft validator: passed: `node scripts/validate-evidence.ts research/drafts/old-babylonian-trial-two/evidence.json` reported structurally valid draft research.
- Bounded semantic/reference check: passed. Checked entry-to-claim links, duplicate IDs, endpoints, both evidence-link directions, date intervals and semantics, metadata mappings, source locators and review-null/draft status. This structural check does not verify source accuracy.
- Finish time: 2026-11-24 15:17:44 UTC.
