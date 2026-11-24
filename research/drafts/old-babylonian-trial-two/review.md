# Second Luna trial: review

24 November 2026. AI-assisted source review, not independent expert review. Drafts only; no live content, builds or deployment.

## What this trial establishes

The first submission did not deliver any entry meeting every assigned requirement. It preserved useful historical material and reported access problems rather than inventing coordinates, but it still needed corrections to evidence recording and completion reporting. We have not demonstrated a saving in total work or cost.

This does not isolate the cause. The model, the six-page source budget, the search strategy and the complexity of the handoff format all contributed to the task conditions. It would be premature to conclude that Luna cannot research history at all. Equally, adding more instructions after every failure would not demonstrate that the current workflow works.

Assignment: `747c51c`, brief revision 3. Model: `gpt-6-luna`, low reasoning. Independent parent reference draft frozen at `5b42305`, before opening Luna's files. Luna first submission frozen at `66ecc73`, before feedback. Review and correction remain separate from the original score.

## First-pass findings

| Claim | Source-content assessment | Recording or integration issue |
| --- | --- | --- |
| samsu-iluna-dates | Dates supported by Charpin's lecture introduction | Single-date value alongside interval is ambiguous for a reign; use the brief's text-value/interval representation. The translated “average” chronology label should be treated as source wording. |
| samsu-iluna-succession | Supported by the sequence of successors in the same introduction | Entry still declares its required Babylon rule connection unresolved. |
| samsu-iluna-babylon-point | Numeric longitude does not equal the cited DMS conversion | Evidence value 44.4208583 differs from entry/association 44.4208333. Correct result is 44.420833333333334. Small spatial error, but an explicit consistency check was missed. A coordinate citation alone also cannot establish the ruler's connection to the city. |
| rim-sin-dates | Supported by the Ministry's reign account | Same ambiguous single-date value beside interval; the historically identified reign distinguishes this ruler, although the cited text does not print “I”. |
| rim-sin-rule-larsa | Supported by the same Ministry account | Required reference point absent. |
| rim-sin-hammurabi-conflict | Supported by the Ministry's fall-of-Larsa paragraph | No personal meeting inferred. |
| larsa-period-window | Met period span supports the explicitly editorial window | A date-value range also describes occurrence uncertainty; use text plus validity for this window. |
| larsa-site-identification | Supported by Tell es Senkereh page | No numeric point supplied. |
| larsa-geography | Both geographical clauses appear in inspected sources | The 14 km clause comes from a different page than the sole linked evidence record. Repair the source link or omit the incidental clause. |
| larsa-rim-sin-relationship | Supported by the Ministry's reign account | Duplicates the reverse relationship claim; not a fabricated relationship. |

Nine of ten claim statements agree with the inspected source content. Eight of ten have correct complete linked support as submitted: the coordinate is wrong and the multi-source geography claim has an incomplete citation link. Three date representations also need clarification. These are separate measures, not a claim of 90% reliability; the strict first-pass standard was not met.

**Usable coverage: 0/3**, rather than the worker's headline 1/3. Its own completion table identifies a missing required Babylon-rule connection; the other two entries lack required coordinates. The phrase “reference point” does not remove the need to support why a place is connected to a subject. The run also omitted the Larsa comparison with the existing Egyptian and Indus windows; its wider window does overlap Indus urban, unlike either reign.

No invented source or passage was found, and no claim was self-approved. All claims remain draft. Inspection/tool counts are worker reports, not independently audited telemetry. The structural validator passed despite the coordinate inconsistency. The claimed semantic check was therefore insufficient. Missing start-time observation was honestly labelled unavailable, rather than guessed.

## Sources independently checked

- [Met period essay](https://www.metmuseum.org/fr/essays/the-isin-larsa-and-old-babylonian-periods-2004-1595-b-c): title and historical overview.
- [Ministry: Larsa's apogee](https://archeologie.culture.gouv.fr/larsa/fr/lapogee-de-la-ville): reign account and fall of Larsa.
- [Ministry: Tell es Senkereh](https://archeologie.culture.gouv.fr/larsa/fr/tell-es-senkereh-1): identification and relative location.
- [Ministry: alluvial plain](https://archeologie.culture.gouv.fr/larsa/fr/la-plaine-alluviale-mesopotamienne): opening setting description.
- [UNESCO: Babylon](https://whc.unesco.org/en/list/278/): published DMS coordinate reference, converted arithmetically.
- [Dominique Charpin: Hammu-rabi's successors](https://www.college-de-france.fr/en/agenda/lecture/mesopotamia-under-hammu-rabi-successors): opening chronological sequence and note 2. The page labels its English as automatic translation.

Two reviewer web calls opened these six pages. Earlier baseline source work is accounted for separately below. Page contents support the narrow retained assertions; this is not a specialist assessment of every chronological system.

## Reference draft and economics

The parent independently produced eleven draft claims with dates, points and the assigned relationships for all three entries. It used four cited sources and inspected five pages, within the six-page ceiling. Getty TGN 6003327 supplies a Larsa point; Laura Cousin's Ministry account supplies Samsu-iluna's Babylon connection and chronology. These were found before reading Luna's output, not provided to the worker during correction, and are linked in the reference package.

The reference draft is not a controlled benchmark or an accepted content pack. The parent designed the brief, had existing project context and wrote sparse prose. Its own source checking supports the eleven statements; another independent reviewer has not assessed it. Its completion and metadata mapping are prose rather than the requested tables, and the Rim-Sin ordinal relies on identifying the dated reign. It should not be scored as perfect compliance merely because the historical fields are populated.

Baseline preparation completed at 15:15:36 UTC; the observed 15:13:43 start includes assignment preparation. Luna reported its first clock observation at 15:15:13 and completion at 15:17:44, with no actual start reading. These are not comparable elapsed-work measurements. The baseline recorded five web calls and seven search queries; Luna recorded three search queries and six inspected source pages. Counts alone do not measure total tokens or expense.

Provider input, output, cached tokens and monetary costs are unavailable for every phase. Review, correction and any future integration must be included before claiming savings. No integration is part of this trial.

## Correction round

One correction round was assigned within the original six-page ceiling, with no new searches or pages. It addresses the recording errors and completion report, not a hidden expansion of the research budget. This means the missing Larsa point remains a blocker unless supported by the already inspected pages. We did not substitute the parent's complete draft for the worker's output or repair its claims ourselves.

The worker completed the correction at 15:20:37 UTC. Parent recheck confirms corrected coordinate arithmetic, consistent references, text values with separate intervals, removal of the mislinked geographical detail, and complete overlap comparisons. It removed Samsu-iluna's unsupported city association and moved the coordinate claim to the Babylon stub. All claims remain draft, all review references null. The corrected statements have source support, but required geography and the explicitly unresolved Babylon rule connection still prevent integration: **0/3 complete entries**. No parent repairs were made to the worker's corrected files.

The existing draft validator and a separate reference/draft/point-consistency check pass. The reference draft also passes those structural checks. These results do not override the historical or completeness assessment.

## Recommendation

Do not expand to a bulk run on the strength of this result. Retain the useful researched facts and the original submission. A further experiment would need to distinguish source-discovery difficulty from extraction and formatting difficulty, rather than simply adding more rules. Providing a small set of selected sources is one possible test; relaxing the research budget is another. Neither is authorised or run here, and neither would demonstrate savings without counting review and preparation.
