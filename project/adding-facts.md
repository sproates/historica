# Adding facts to Historica

A useful addition lets someone explore a piece of history, see what overlapped with it and follow its connections. It also lets them find the evidence behind what we say. This guide covers the research, the files to change and the checks needed before publication.

## Start with a question

Choose a manageable subject and time window. That might be a person, a city's development, an event or everyday life in a region. Check what we already have before creating another entry.

For example, if you're expanding an existing ruler's story, look for their predecessor, successor, dynasty and places of activity. For a regional overview, consider settlements, food, work, exchange, beliefs and neighbouring societies as well as named people and wars. A region with few written records still has a history.

The current collection concentrates on roughly 3000 BCE to 200 CE, with earlier Egyptian material and some context outside that window. The [research programme](../research/programme/PLAN.md) describes the wider coverage ambition; its early hosting and development notes are historical. Use [CONTRIBUTION.md](../CONTRIBUTION.md) for the current working process.

## Research the claim before writing the entry

Open the source and inspect the relevant passage. Prefer specialist scholarship, excavation reports, museum catalogues and authoritative reference works appropriate to the subject. Search results, AI answers and a plausible-looking URL are leads to investigate.

For each assertion, record:

- What the source supports, including any qualification or disagreement.
- The author or institution, title, direct URL and the date you accessed it.
- A page, section or catalogue reference that lets someone find the passage.
- The relevant place and dates, with their original wording and precision.
- Whether the material supports the claim, contradicts it or supplies background context.

One suitable source can support a straightforward statement. Seek independent corroboration for disputed dates, interpretations or reconstructed boundaries. Don't count copies of the same account as independent sources.

Write your own summary and retain attribution. Record reuse terms for text, data and maps separately. A source being readable online doesn't make its images or wording available to copy.

Keep unsupported material in a draft research file, outside the published evidence packs. Never record a source as inspected, or a review as verified, unless that work actually happened. An AI-assisted review must identify itself as such; it isn't independent expert review.

## Put each part in the right file

| What you're adding | Where it belongs |
| --- | --- |
| A person, area, state, city, period or event | `content/histories/<id>.md` |
| The entry's pack membership, dated places and connections | `content/packs/<pack>.yaml` |
| Claims, sources, supporting passages and review decisions | `research/evidence/<pack>-reviewed.json` |
| Unfinished research and unresolved questions | A separate draft under `research/` |
| Regional research progress | The relevant research batch and coverage records |

Keep IDs stable, lower-case and separated by hyphens. Search for existing IDs and names first. An entry's filename must match its `id`, and it must belong to exactly one content pack. Reuse existing people and places instead of creating near-duplicates.

Don't edit generated files in `web/generated/`, `web/pages/`, `web/data/reviewed-*.json` or `research/evidence/*-exploration.json`. Builds overwrite them.

### Adding a fact to an existing entry

Add or revise the evidence records, include the supported claim IDs in the entry's `claimIds`, then update its prose. Check that the revised wording stays within what those claims support. A new sentence can introduce several assertions, so don't attach an unrelated existing citation just to give it a source link.

If a correction invalidates an earlier claim, record the reason and remove it from the published claim set. Retain the research history in Git or a draft record. The release validator rejects unaccepted claims in the combined published evidence.

### Adding a new entry

Use a reviewed entry such as [Delium](../content/histories/delium.md) or [Khufu's reign](../content/histories/khufu-reign.md) to understand the format. Some older entries remain provisional and don't illustrate the evidence standard for new work.

The Markdown file starts with YAML metadata between `---` lines. It needs `id`, `type`, `title`, `startYear`, `endYear`, `point` and `url`. Reviewed additions also need their `claimIds`. Use `note`, `dateLabel`, `region` and `regionIds` to explain dates and place the entry sensibly in the interface.

The six supported types are `person`, `area`, `state`, `city`, `period` and `event`. A reign is a period, not the ruler's lifespan. A geographical area and a state can overlap, but they aren't interchangeable.

Add the ID to an existing content pack's `entities` list, or create a new pack with a unique integer `order` and `entities`, `associations` and `relationships` arrays. New YAML packs are discovered automatically.

**New evidence JSON files are not discovered automatically.** Register a new reviewed pack in the `packs` list in [scripts/build-evidence.ts](../scripts/build-evidence.ts). Prefer extending an appropriate existing pack for a small addition. Don't add new reviewed material to the legacy prototype pack to avoid the evidence checks.

## Connect the evidence

The [evidence format](../research/evidence/FORMAT.md) defines the complete fields. The chain is:

`entry.claimIds → claim.evidenceIds → evidence.sourceId → source URL and locator`

A claim also names its subject and review. Supporting evidence has its own review reference. An accepted claim needs verified supporting evidence and a verified claim review; those references can name the same review when it genuinely covered both checks. Context-only citations don't qualify as support.

As a worked example, the existing `delium` entry points to `alcibiades-era-delium-history`. In [its evidence pack](../research/evidence/alcibiades-era-reviewed.json), that claim points to `alcibiades-era-delium-history-socrates`, which identifies the source, passage locator and review. Follow that chain in the files to see how the displayed text reaches its evidence. Preserve the distinction it makes between an event and later literary testimony.

For new work, keep claims small enough to review independently. Don't copy that example's review date or status into a new claim. Each new review must describe what was actually checked. IDs must remain unique across the combined published packs.

## Make time and place useful

Use negative numbers for BCE and positive numbers for CE. There is no year zero. Keep an event's duration separate from uncertainty about when it happened. The interface stores a display interval; the evidence record preserves the original dating and its precision. Don't invent an error margin or silently convert archaeological dating conventions.

A geographical study window describes the period we've researched. It doesn't mean the place began or ceased to exist at those dates. A person's dates should describe their life unless the entry explicitly represents another kind of period.

Coordinates use `[longitude, latitude]`. Keep `point: null` until you have a supported location. For reviewed entries with a point, the build requires a linked point claim with matching coordinates. Explain whether it's a reference point, residence or documented presence. A city-centre reference must not imply an exact battlefield location.

Add dated place associations in the content pack so the map can change with the selected years. Each association has a `subject`, `place`, interval, `point`, `label` and `source`; add the relevant `claimIds`. Check that both IDs exist. Don't extend a brief visit across someone's whole life or infer a route between two known locations.

Add supported navigation connections in `relationships`, using `a`, `b` and a readable `label`. Directional labels, dates, source URLs and a note about the basis can make the connection clearer. A shared century alone doesn't establish a personal relationship. Relationship links also need research support even where the validator doesn't enforce every citation.

Use `region` for a sensible timeline lane and `regionIds` for recorded membership of existing regions. Neither field supplies a historical border. New boundaries need sourced geometry, dates, provenance and reuse terms, plus confirmation that the map can actually display them; adding a geometry claim alone doesn't wire up a new overlay.

## Write for someone who's curious

Introduce the subject, then explain the details that make it worth exploring. Use plain British English and short paragraphs, with one idea in each. Give enough context to understand the subject without turning every entry into an essay. Around 100–180 words is often enough for an overview, but don't pad sparse evidence to reach a target.

Keep uncertainty alongside the claim it qualifies. Avoid grand claims about importance unless you can explain and support them. The description renderer preserves paragraphs, but doesn't render headings, Markdown links or embedded HTML as rich content. Put source links in the structured fields.

## Check and publish

Use Node 26 and the existing checkout. Install locked dependencies with `npm ci` if needed. For a change to the Alcibiades evidence pack, for example:

```sh
node scripts/validate-evidence.ts research/evidence/alcibiades-era-reviewed.json --release
npm run build:evidence
node scripts/validate-history.ts
```

Use the corresponding filename for your change. These commands check evidence structure and assemble the collection, including IDs and references. They don't establish historical truth. Run relevant existing data tests when you change a relationship, date or location that they cover; don't rerun the whole app suite for every individual fact.

Refresh the existing preview with `npm run preview:sync` when you need to inspect the result. Check that the entry is searchable, appears in the expected years and region, links to the intended histories and shows the right places. Open its evidence links. Use the Mac's Wi-Fi address on port 4173, not a loopback address on your phone.

Commit authored files on a descriptive branch and open a PR. CI checks the change and can reuse unaffected static pages. After merge, it reuses the verified PR package when the source tree matches. Don't rebuild or repeat completed checks just to publish it.

Historical records, dates, sources, relationships and geography can be published after their checks without a separate design approval. Changes to site wording, layout or interactions need Ian's Wi-Fi preview approval. Keep those separate from a data release if they're still awaiting review. Follow [RELEASE.md](../RELEASE.md) to publish the retained production package; merging alone doesn't deploy it.

## A brief you can give an agent

> Add or expand [subject] for [place and period]. Follow `project/adding-facts.md`. Check for existing records first, inspect suitable sources and retain their passage references. Add supported connections and dated places where useful. Preserve uncertainty and leave unsupported locations empty. Write in short, plain paragraphs, run checks appropriate to the change and open a PR. Report what was added, the evidence inspected and any remaining gaps. Keep design changes separate.
