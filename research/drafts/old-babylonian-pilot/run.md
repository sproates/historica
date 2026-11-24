# Calibration run

- Model: gpt-6-luna (low reasoning). The requested gpt-6.1-luna was unavailable and rejected; this substitution was disclosed before the run.
- Brief: `project/research-agent-pilot.md`, commit `d7e9a7a1771938d7152fdd509419e5396cc796a3`.
- Original run start/finish: unavailable. The earlier approximate timestamps were unreliable and are withdrawn.
- Correction round completed: 2026-11-24 14:45:26 UTC. Time spent on correction: not reliably measured.
- Scope: three requested calibration items only; nine claim records; six distinct source pages.

## Pages inspected

1. The Metropolitan Museum of Art, “Mesopotamia, 2000–1000 B.C.” — overview and ca. 1800–1600 B.C. key event.
2. Louvre Collections, “Code de Hammurabi” — catalogue date, object description and inscriptions.
3. French Ministry of Culture, “Hammurabi” — dates, defeat/destruction account for Mari, and successor summary.
4. French Ministry of Culture, Mari archaeological mission, “Excavation history” — site identification, location, tablets and excavation context.
5. French Ministry of Culture, Mari archaeological mission, “Mari” — city setting and Great Royal Palace archive description.
6. University of Chicago Institute for the Study of Ancient Cultures, “Back to School in Babylonia” — House F and the curriculum study.

The Louvre catalogue page was directly opened and inspected. Some pages on the University of Pennsylvania ORACC site timed out, and an attempted Britannica page could not be opened; neither was cited. These are access limits, not support for any claim.

## Gaps and status

- `hammurabi-reign`: conventional approximate start and end dates are carried as separate validity endpoints. Met and Ministry pages support the reign dating; Louvre’s stele date is retained as context only. Alternate absolute chronologies were not examined. Military expansion is summarized at broad scale only.
- `mari`: the archaeological mission and Met support the site identification and palace archive summary. No coordinates or founding/end dates are asserted. Ministry evidence for the city’s defeat/destruction is context for the Met’s palace-specific claim. The city entry is not integration-ready.
- `old-babylonian-schooling`: the University of Chicago publication page supports the bounded House F summary and describes the school identification as “widely believed.” It does not provide narrower dates for the activity; entry date bounds and point remain null, so it is not integration-ready.
- Babylon and Nippur are explicitly proposed dependency stubs, not confirmed existing collection records. No Hammurabi-person record is required by this draft.
- Null entry dates or coordinates mean the draft is not integration-ready. All claims and evidence remain drafts with null review references; reviews and accounts are empty.

## Checks and usage

- Draft validator: passed — `node scripts/validate-evidence.ts research/drafts/old-babylonian-pilot/evidence.json` reported structurally valid draft research. This checks structure, not historical truth.
- Calls recorded from this run: web tool 8 total (3 search batches, 5 open batches); workspace command tool 8 total (including correction edits and validator). The open batches included pages that failed to load as noted above. This count excludes messages and internal reasoning.
- Provider input/output/cached tokens and monetary cost: unavailable from the runner. No cost or token saving is claimed.
- Output: 3 entries, 9 claim records, 6 distinct source pages. One correction round completed at the parent reviewer’s request; no new research or sources added. The frozen original is commit `6b1faaf`.
