# historica worldwide coverage plan

We need a repeatable way to research the world from 3000 BCE to 200 CE, so that coverage grows without Ian having to request individual facts. The first outcome is a useful, sourced account of each region throughout this span. We then add the people, events and geographical detail that make those accounts explorable.

Product: historica, previously Timeline. The repository stays private during prototype development. Run research validation and any builds manually on the Mac; no GitHub CI or Actions at this stage.

Status: planned programme. The research queue is initialised; no automated research schedule or publication process has been started. Existing prototype content remains subject to audit.

## Scope and the Egyptian starting point

The main coverage window is 3000 BCE to 200 CE, inclusive. Include earlier or later material when it explains a life, society or development crossing these boundaries, but do not count it as completion of another programme.

Add an introductory Egyptian collection covering approximately 5500–3001 BCE. This accommodates the requested Predynastic starting point without expanding the worldwide commitment by another 2,500 years. Egypt’s Ministry of Tourism and Antiquities places the Predynastic period at 5500–3100 BCE; these are source-specific dates, not an assertion that all chronologies agree. [Predynastic Period](https://egymonuments.gov.eg/en/historical-periods/predynastic-period)

This programme covers all parts of the world. Regions without named rulers or written records need accounts of settlement, livelihoods, material culture and connections. Where evidence supports no known settlement, report that finding with its geographical scope and uncertainty. Never assume an area was empty because our database is empty.

## Writing the entries

Use Ian’s plain, direct British English for reader-facing accounts. Explain how the facts connect, with enough context for a curious reader to understand the subject. The expanded Khufu entry is the first example of this approach. Avoid isolated catalogue statements such as “the pyramid belongs to Khufu”, inflated praise and em dashes.

Aim for roughly 100–180 words where the evidence supports a fuller overview, without padding sparse material to meet a target. Introduce the person, place or period, then develop the details that explain it. Connections to predecessors, contemporaries, everyday life or neighbouring places should earn their space. Do not force every entry into the same structure.

Keep reader-facing prose separate from the individual evidence claims. Every added factual assertion must be supported by linked, inspected sources and included in the entry’s claim references. Preserve approximate dates and uncertainty; distinguish a reign from a lifespan or construction interval. A fuller account must not imply fuller evidence than we have.

## What full coverage means

Completion has three separately reported levels.

| Level | Required result |
| --- | --- |
| Regional overview | Every research area and time window has a checked account, or a checked explanation of the evidence limits. All required themes have been considered. |
| Connected exploration | The main societies, places, developments and documented people identified by the regional research are linked. Each region has useful routes through the timeline. |
| Detailed geography | Supported dated locations, reigns and territorial interpretations are available where evidence allows. Missing boundaries remain explicitly missing. |

We can finish the overview without claiming that detailed coverage is complete. An evidence-limited result counts as research completed, but is reported separately from substantive coverage. Record counts never prove completeness.

## Research geography and time windows

The machine-readable queue is in `coverage.json`. It defines 28 provisional research areas and 13 time windows, giving 364 initial regional work packages. These divisions organise work; they are not ancient countries, cultural boundaries or map polygons.

| Group | Research areas |
| --- | --- |
| Africa | Egypt and the Nile delta; Nubia, northeast Africa and the Horn; North Africa and the Sahara; West Africa; Central Africa; eastern and southern Africa |
| Europe | Britain and Ireland; northern Europe and the Baltic; western and central Europe; Mediterranean Europe and the Balkans; eastern Europe and the Pontic steppe |
| Asia | Anatolia, the Caucasus and the Levant; Mesopotamia and Arabia; Iran; Central Asia and the Inner Asian steppe; South Asia; East Asia including Korea and Japan; mainland Southeast Asia; island Southeast Asia |
| Americas | North America north of Mesoamerica; Mesoamerica; the Caribbean; the Andes and Pacific South America; Amazonia and other lowland South America |
| Oceania | Australia; New Guinea and Near Oceania; Remote Oceania |
| Polar regions | Antarctica and subantarctic islands; Arctic communities are assigned to their continental research areas |

Before researching an area, record its extent and named subregions. Broad areas must be subdivided where a single account would hide different histories. Parent completion requires each child to pass its own checks. Cross-border subjects can belong to several areas; use one entity and several coverage links.

The initial windows are 3000–2751 BCE, 2750–2501 BCE, continuing in 250-year blocks through 250–1 BCE, followed by 1–200 CE. There is no year zero. These are queue boundaries, not historical periods. Preserve a source’s historical dates and let one record support several windows. Narrow windows for detailed research when justified; do not manufacture changes every 250 years.

## The regional account

Each work package must address these themes, with supported statements or a recorded evidence limitation:

1. Settlement, population evidence and patterns of mobility.
2. Food, work, technology and exchange.
3. Social and political organisation, including societies without states.
4. Beliefs, knowledge, art and material culture.
5. Developments and continuities within the window.
6. Connections with neighbouring and more distant regions.

Named people, states, cities, events and conflicts are added where relevant. They are not mandatory quotas. Research should include local scholarship and languages where available, with the original reference retained alongside any translated summary.

A checked account needs an explicit geographical scope, dated claims, a readable summary, source links, evidence limitations and connections to neighbouring coverage. It must distinguish evidence about one site from evidence about a whole region. Do not extrapolate a regional account across several centuries without support.

## Evidence standard

Every displayed historical assertion must resolve to one or more evidence records. This applies to titles that assert a date or role, summaries, lifespans, relationships, map positions, boundaries and regional descriptions. Sources belong to claims, not merely to biographies.

| Record | Minimum information |
| --- | --- |
| Entity | Stable ID, type, names and aliases, external identifiers where useful |
| Claim | Subject, assertion or relationship, value, geographical scope, applicable dates, precision and dispute status |
| Source | Author or institution, title, publisher, publication date if known, direct URL or stable identifier, access date, language and reuse terms |
| Evidence | Claim ID, source ID, page/section/catalogue locator, concise evidence note, support or contradiction, verification status |
| Geometry | Place ID, validity interval, source and licence, reconstruction method, uncertainty and interpretation |
| Coverage account | Region, interval, theme findings, linked claims, unresolved gaps and review record |
| Review | Reviewer or process, date, checks performed, decision and reason |

Prefer specialist scholarship, archaeological reports, museum catalogues and authoritative reference works appropriate to the claim. Ancient texts are evidence requiring interpretation, not automatically more reliable than modern scholarship. Syndicated copies of one account are not independent corroboration.

One suitable source can support a straightforward claim. Seek independent corroboration for consequential interpretations, disputed dates, reconstructed boundaries or contradictory accounts. Preserve disagreements rather than choosing an average date or quietly discarding one source. A numerical AI confidence score is not historical evidence.

A link must identify material that was actually inspected. A search snippet or inaccessible citation is a discovery lead, not verified support. For books and PDFs, retain the relevant page or section. Prefer an accessible supporting link; label paywalls and access limitations. Keep only permitted excerpts or local copies, and preserve attribution and licensing separately for code, text, data and maps.

Wikidata provides useful identifiers and a model of statement-level references; imports still need claim review. PeriodO supplies sourced definitions of historical periods, including definitions that overlap or differ. We will reuse identifiers and source-specific definitions rather than force a universal period scheme. [Wikidata sources](https://www.wikidata.org/wiki/Help:Sources), [PeriodO guide](https://perio.do/guide/)

## Time and place rules

Store event duration separately from uncertainty about its start and end. Preserve calendar information and original date wording, and document conversion to the app’s BCE/CE convention. Archaeological dates need their dating method and calibration context where supplied. Never turn an approximate century into a falsely exact year.

A person’s association with a city, residence there, presence at an event and rule over a territory are different claims. Show a documented location only during its supported interval. Do not infer continuous residence or travel routes between isolated observations.

Keep settlements, geographical regions, states and archaeological cultures distinct. A material distribution is not automatically a political frontier. Modern borders are a comparison layer. Unsupported historical polygons stay out of the accepted collection.

## Research workflow and automation

Use versioned structured files initially, with separate directories for sources, claims, entities, regional accounts, draft batches and accepted releases. Migrate prototype data out of display-oriented JavaScript through an adapter so the working app remains usable.

Each run reads a named work package and writes a resumable batch. Proposed pilot limits are one region/window, up to 20 inspected sources and up to 40 candidate claims per run. These are resource limits, not content targets. Record actual elapsed time and usage. A financial ceiling must be configured before using a paid unattended service; no budget is assumed here.

| Step | Output and check |
| --- | --- |
| Select | Choose an unresearched or weakly covered package. Rotate broad geographical groups before deepening an already rich region. |
| Discover | Candidate sources and topics, with reasons for relevance and access/licence checks. |
| Extract | Atomic claims, source locators and original uncertainty. Unsupported candidates remain leads. |
| Reconcile | Match names and external IDs; identify duplicates, conflicting claims and cross-region connections. |
| Draft | Short descriptions generated only from the supported claim set, with sentence-to-claim links. |
| Validate | Schema, references, interval arithmetic, relationship consistency, geographical scope and reuse checks. |
| Verify | Inspect whether evidence actually supports the wording, dates and extent. Log contradictions and unresolved judgement. |
| Release | Produce a versioned accepted data build after the configured review rules pass. Update coverage and preserve rollback. |

During the pilot, review every candidate before acceptance. Later, allow direct imports only from explicitly approved dataset fields and tested mappings, with provenance retained and sample audits. AI-written synthesis, territorial interpretations and unresolved conflicts stay in the review queue. Independent AI agreement does not substitute for evidence verification.

Retries must not duplicate entities or claims. Save checkpoints, source retrieval outcomes, rejected candidates and reasons. Stop a batch at its limits, on repeated retrieval failures or when review capacity is exhausted; leave its package incomplete and move on to independent work where possible. Research may continue elsewhere while one claim awaits judgement.

The batch report gives accepted and draft counts, themes covered, sources inspected, conflicts, gaps, costs where available and the next package. Ian reviews genuine editorial exceptions rather than selecting every fact.

## Coverage tracking and acceptance

Track workflow state separately from evidence availability. Workflow states are unresearched, gathering, drafted, checking and accepted. Evidence status is unknown, substantive or limited. A blocked batch has a reason and resumable checkpoint; it is not accepted coverage.

Report substantive overview coverage, checked evidence limitations, work awaiting review and unresearched packages separately. When regions split, keep the queue version and denominator visible so apparent progress cannot increase through administrative changes. Add a geographic and chronological breakdown, claim-level evidence completeness and the oldest outstanding reviews.

A package passes overview review only when all six themes have a supported finding or justified limitation, source scope matches the account, disagreement is visible, and the visitor can open the supporting references. A link checker establishes that a URL responds, not that the source supports the claim.

The release build must reject historical claims without accepted evidence, broken entity references, unexplained exact dates derived from broad ranges, and geometries without provenance. Computed ages and overlaps retain links to their input claims and preserve uncertainty.

## Delivery backlog

| ID | Work package | Dependency | Acceptance condition |
| --- | --- | --- | --- |
| P01 | Claim, evidence and uncertainty schemas | None | Worked fixtures cover exact, approximate, disputed and unknown dates, relationships, regional context and geometry. |
| P02 | Audit the 68 prototype entities and their claims | P01 | Every displayed assertion is mapped to evidence or explicitly retained as an unverified prototype draft. No inherited automatic acceptance. |
| P03 | Coverage registry and dashboard | P01 | Read the 364-package queue; show workflow and evidence status independently; support splitting areas. |
| P04 | Draft batch runner and source adapters | P01 | A bounded run checkpoints, retries safely and emits candidates with evidence; reruns do not create duplicates. |
| P05 | Review queue and accepted data build | P02, P04 | Unsupported claims cannot enter an accepted build; corrections and rollback retain provenance. |
| P06 | Source access and regional context in the app | P01, P05 | Sources are reachable from claims and map features; context appears within the existing single-focus model. |
| P07 | Contrasting-region pilot | P03–P06 | Pilot passes the scenarios below and reports measured throughput, cost and review workload. |
| P08 | Worldwide overview campaign | P07 | Every package has accepted overview coverage or a checked evidence-limited outcome, with splits accounted for. |
| P09 | Connected exploration and geography | P08 per region | Regional source surveys drive deeper work; dated roles and supported locations become navigable. Boundaries are added only when supported. |

P02 and P03 can proceed independently after P01. P08 uses rotating regional batches rather than completing all of Egypt before beginning other parts of the world. P09 can begin in regions whose overview is accepted, but overview gaps retain priority.

No completion date or fact-count target is committed yet. Measure the pilot, estimate remaining work separately by evidence type, and include review time and source-access limits. A schedule without those measurements would be guesswork.

## Pilot and visitor scenarios

Start with the existing 500–251 BCE queue window in five areas: Britain and Ireland; Mediterranean Europe and the Balkans; East Asia; Egypt; and Mesoamerica. Research the full window; use Socrates’ lifetime and trial as narrower navigation checks. Add one separate Egyptian introduction batch to test earlier archaeological chronology.

The pilot must demonstrate:

- Focus on Socrates, select Britain and Ireland, and preserve the visible dates. Show researched regional life even if no named contemporary people are available.
- Select Socrates’ trial, then China, and show only context whose evidence supports overlap with the selected date. A broad composition range remains visibly broad.
- Compare Egypt and Mesoamerica within one time window without equating their period names or forcing identical detail.
- Open a factual sentence, date, relationship or map feature and inspect its supporting source and locator.
- Distinguish an unresearched area from a researched area with limited evidence.
- Narrow the timeline and remove location claims outside their supported dates. Retain pinch, pan and keyboard map controls.
- Rerun a research batch, correct a claim and reproduce the accepted build without duplicates or loss of history.

## Implementation progress

P01 now has a versioned claim/evidence format, local validator, draft pilot fixtures and rejection tests. See [the format](../evidence/FORMAT.md). The fixtures include uncertain dates, a relationship, spatial provenance and an unresearched regional account. They have not been promoted to accepted content. P02 has started: a reproducible inventory contains 456 review items across 68 entities, and four source-checked statements are available in the app. The remaining audit, including source disagreements, is pending. P03 now has a local coverage dashboard with separate workflow/evidence filters, pilot selection, package details, bookmarkable views and a tested subdivision operation. The first manual Britain/Ireland batch contains 13 draft statements from six inspected sources; regional and chronological gaps remain explicit. No region has yet passed overview acceptance. Automated research remains unimplemented; the accepted evidence build now includes four Socrates statements and 22 regional statements, with ten exploration entries. The follow-up includes Castell Henllys, Doogarrymore wheels and later Corlea construction; uncertain overlaps are labelled in the timeline and map. Britain/Ireland’s 500–251 and 250–1 BCE packages are in checking, with no accepted regional overview. Broad archaeological context has explicit scope and uncertainty labels.

## Original first implementation package

Begin P01 with a small set of evidence fixtures drawn from the existing prototype: Socrates’ dates and trial, a regional account for Britain and Ireland, a disputed date and the Bactria outline. The fixtures should establish what the format can express; historical content enters the accepted collection only after the sources have been checked.

The accompanying queue and batch specification are planning artefacts. They prepare the work for automation; they do not themselves schedule research, run agents or publish content.
