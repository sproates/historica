# Historical evidence format

Version 1.0 separates entities, historical claims, sources, evidence and review decisions. The executable validation contract is `scripts/lib/evidence.ts`. `pilot.json` supplies structural examples; all historical claims in it remain drafts. It is not an accepted content pack.

## Records

| Collection | Required fields |
| --- | --- |
| entities | id, name, type: person, area, state, city, period or event |
| sources | id, title, creator, url, locatorHint, accessed (YYYY-MM-DD), reuse |
| claims | id, subjectId, predicate, typed value, statement, validity (interval or null), scopeIds, status, certainty, evidenceIds, reviewId (or null), disputeNote (or null) |
| evidence | id, claimId, sourceId, locator, note, relation: supports, contradicts or context; reviewId (or null) |
| reviews | id, reviewer, date, reason, decision: verified, rejected or needs-review |
| accounts | id, regionId, start, end, status, sentences, themes, reviewId (or null) |

IDs are stable and unique within each collection. References resolve within a package in this first version. A future package assembler will resolve references across files before validation.

A claim status is draft, accepted or rejected. Certainty is uncontested, disputed or unknown. An accepted disputed claim is possible if the disagreement is explained and the presented statement has verified support. Do not confuse publication status with historical certainty.

## Values and dates

A value has one of five types: date, entity, text, point or geometry. Entity values refer to another entity ID; text values carry text. Points use longitude and latitude and distinguish reference, documented-presence, residence and territorial-association. Geometry currently accepts GeoJSON Polygon with closed rings, a licence, reconstruction method and interpretation. Expand geometry support through a versioned change when required.

A date has precision (exact, approximate, range or unknown), earliest and latest year bounds, original wording and calendar. This version uses BCE/CE signed year numbers with no year zero. Unknown dates have null bounds. Exact dates have equal bounds. Approximate dates may have equal bounds when only an approximate central year is available; do not invent error margins. Original wording preserves the source’s qualification.

A validity interval has independently uncertain start and end dates. A value describing a birth date is a date claim; a residence’s duration belongs in validity. This keeps uncertainty about an occurrence separate from an event’s duration. Point and geometry claims always require validity. BCE/CE conversion, calibrated archaeological dates and non-year precision need further format work before those records can be imported without loss.

## Regional accounts

Each summary sentence has text and a non-empty claimIds list. Every account considers six themes: settlement-mobility, livelihoods-technology-exchange, social-political-organisation, beliefs-knowledge-arts, change-continuity and external-connections.

A theme is unresearched, supported or limited. Supported themes link claims. Limited themes require an explanation of the research and source IDs. Neither an empty account nor unresearched themes can pass acceptance. The Britain and Ireland fixture is intentionally empty and unresearched; it makes no claim about the historical evidence available there.

## Local checks

Run `npm run validate:research` for the pilot draft, or:

```sh
node scripts/validate-evidence.ts path/to/package.json
node scripts/validate-evidence.ts path/to/package.json --release
npm test
```

Draft validation checks structure and references. Accepted claims are held to acceptance rules even inside a draft package. Release validation additionally requires every claim and account in the supplied package to be accepted. The pilot deliberately fails release validation.

An accepted claim needs supporting evidence with a verified evidence review and a verified claim review. Context-only citations do not qualify. Contradictory evidence must be disclosed. Accepted accounts require supported sentences, completed themes and a verified account review.

These checks validate declared review records. They cannot establish that a reviewer read a source, that a licence is suitable or that an interpretation is sound. Source-content review, licence review and eventual release assembly remain separate work packages. There is no automatic promotion or publication command, and the prototype still reads its existing collection.
