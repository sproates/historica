# Three-item calibration review

24 November 2026. AI-assisted source review by the parent agent, not expert historical review. Nothing in this experiment has been imported or published.

## Decision

Luna produced useful research drafts, but this does not yet demonstrate a cheaper content workflow. The first submission needed corrections to date semantics, citation roles, metadata and its run log. Keep full source review and do not expand to the other nine subjects yet.

Original submission: commit `6b1faaf`. Worker: `gpt-6-luna`, low reasoning. The attempted `gpt-6.1-luna` runner was unavailable; the substitution was disclosed. Original brief: `d7e9a7a1771938d7152fdd509419e5396cc796a3`.

## First submission

The reviewer opened all six cited pages and checked the nine claim records, their 13 evidence links, entry text, metadata and the one relationship. No invented source or passage was found. The worker did not approve its own evidence or alter published content. Its reported tool counts are self-reported, not independently audited execution telemetry.

| Claim ID | First-pass result | Finding |
| --- | --- | --- |
| hammurabi-dates | Needs correction | Reign duration was encoded as uncertainty around one date. The Louvre dates an object using the reign label; it is contextual evidence, not an independent explicit reign account. The Met and Ministry support the conventional reign dates. No disagreement was supplied to justify `disputed`. |
| hammurabi-king-babylon | Supported | Met overview and Louvre description support the identification. |
| hammurabi-expansion | Supported | Matches the Met's broad summary; does not establish borders. |
| hammurabi-destroys-mari-palace | Supported, citation repair | Met explicitly supports the palace statement. The Ministry describes Mari, so that second link should be context. |
| mari-site-identification | Supported | Archaeological mission's opening excavation-history paragraph. |
| mari-palace-tablets | Supported | Archaeological mission's account of the Great Royal Palace. |
| mari-palace-record | Supported | Met key-events section. |
| nippur-school-evidence | Supported | Chicago book description, both paragraphs. The qualification about school identification is retained. |
| nippur-school-period | Supported | Chicago explicitly supplies the period context. |

Conservative first-pass score: **8 of 9 claim records fully correct as submitted (88.9%)**, below the proposed 90% threshold. This includes the date representation and wording in the assessment, not just whether a plausible date appeared somewhere. The other eight have direct source support, although one also has a wrongly classified supplementary citation. This is a small descriptive score, not a reliability estimate.

The records are not uniformly atomic: the House F record combines excavation date, school interpretation and curriculum. Do not treat nine records as nine independent facts, or compare cost per claim across differently bundled submissions.

Additional findings:

- Mari's date note included facts without claim mappings; metadata references were incomplete.
- Two entries had no proposed date bounds and all three had no researched coordinates. Abstention was appropriate, but the output is not ready for the map and timeline.
- Three entity stubs needed to be identified as proposed dependencies, not existing collection records.
- The original finish time was guessed incorrectly: it said 14:45 UTC, although the parent had frozen the submission by 14:42:11 UTC. Discard those timing figures. This is a logging error, not evidence of a fabricated historical source.
- The source and claim ceilings were respected. One inspected source had no evidence links, so six pages were not all necessary for the retained claims.
- The structural validator passed despite the date-semantic error. Its result must not be presented as historical validation.

## Sources checked

- [Met chronology](https://www.metmuseum.org/toah/ht/03/wam): overview and ca. 1800–1600 BCE key events.
- [Louvre SB 8](https://collections.louvre.fr/en/ark:/53355/cl010174436): description, catalogue date and places/dates.
- [Ministry: Hammurabi](https://archeologie.culture.gouv.fr/babylone/fr/glossary/hammurabi): opening reign account and following campaign account.
- [Mari excavation history](https://archeologie.culture.gouv.fr/mari/en/excavation-history): site identification and palace tablets.
- [Mari overview](https://archeologie.culture.gouv.fr/mari/en): opening city description and palace section.
- [Chicago: Back to School in Babylonia](https://isac.uchicago.edu/publications/back-school-babylonia): two book-description paragraphs. This is a publication summary, not review of the underlying excavation reports.

## Independent baseline and cost

The parent drafted the same three subjects before reading Luna's files. The baseline is preserved alongside the pilot in `../old-babylonian-baseline/`. Its six narrow claims use the Met and [NYU's B6063 catalogue](https://isaw.nyu.edu/exhibitions/before-pythagoras/items/b-6063/). Source review supports the six textual claims, including the uncertain Nippur attribution. Both evidence packages passed the draft validator.

The baseline is also incomplete: no coordinates, structured relationships or comparison with existing Egyptian and Indus entries. Mari's dates are an explicitly editorial window; the tablet's broad dating is not continuous school activity. Neither should be imported as a historical lifespan. The shorter text and fewer sources are not equivalent coverage to Luna's submission. The parent also prepared the brief and had prior familiarity with the Met source, so this is not a blinded or controlled comparison.

Provider token counts and monetary costs are unavailable for worker, reviewer, corrections and baseline. The baseline logged roughly 52 seconds for its drafting interval, excluding brief preparation; Luna's original elapsed time is unusable. The worker reported eight web calls and five workspace calls before correction. The baseline reported two web calls. These counts do not include equivalent review work and do not establish savings. No content integration was attempted.

## Next experiment

Before scaling, tighten the brief with a worked reign-interval example, explicit metadata mappings, dependency labels and a rule to record unavailable timing rather than estimate it. Retest those requirements on a fresh small sample, with one shared source table and the same full review. Keep the one-correction limit. A successful corrected draft cannot erase the first-pass result.

## Correction round

The worker corrected the interval representation, citation roles, metadata references and dependency labels. It removed the unused person stub and withdrew its guessed original timestamps. No new sources were fetched. The worker reported correction completion at 14:45:26 UTC; no reliable correction duration or provider usage was available.

Parent recheck found two leftovers: the date statement still attributed reign dates directly to the Louvre, and its retained context evidence was omitted from the claim's evidence-ID list. The parent removed that attribution and restored the context reference. These are reviewer repairs, not a flawless worker correction. The parent also changed “atomic claims” to “claim records” in the log and made the description point to this review.

After those repairs, all nine retained claim statements have inspected source support. All review IDs remain null and claims remain draft: this report is not formal acceptance into the collection. The missing geography, two missing timeline intervals, regional metadata needing explicit provenance, and incomplete navigation remain integration work. No entry is approved for publication.

Final targeted checks: both draft evidence packages validate; entry claim references and relationship endpoints resolve within each draft package. This does not establish that proposed dependencies exist in the live collection. No application build was necessary.

