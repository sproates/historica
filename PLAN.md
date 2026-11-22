# historica project plan

Product renamed historica. Private development in `sproates/historica`; planned public domain `historica.online`. Public repository and GitHub Pages follow a sufficiently mature prototype. Builds and verification run manually on the Mac; no GitHub CI or Actions yet.

Original prototype proposal, 22 November 2026.

The current coverage programme is [Worldwide coverage from 3000 BCE to 200 CE](research/programme/PLAN.md). It supersedes this document’s initial record ceiling and deferral of automated research. The material below retains the original prototype rationale.

Timeline is an open-source website for anyone curious about history. It connects events, people's lives and historical geography so that a visitor can understand what was happening in different places at the same time.

We should begin with a small, sourced collection that proves the experience. The structure should support all of human history; coverage will grow in stages. A largely empty timeline presented as comprehensive would undermine the product.

## Agreed direction

- Audience: curious people, with no specialist knowledge required.
- Medium: web first, with a possible app later.
- Scope: all of human history, selective in detail.
- Purpose: explore connections and context, with short explanations and links for further reading.
- Open source: make the code public and enable contributions, with clear terms for content reuse.

Timeline is not intended to become an encyclopaedia or an academic reference service. Sources and uncertainty still need to be visible because visitors should be able to understand the basis of what they see.

## Questions the first prototype must answer

These are research and interaction scenarios, not assertions that their wording implies a single exact historical date or boundary.

| Scenario | What the visitor should be able to do |
| --- | --- |
| Newton and calculus | Find the relevant period of Newton's work and see which English monarch's reign overlaps it. Distinguish development from publication if the evidence requires it. |
| Socrates and China | Select Socrates' trial and discover a small, sourced selection of contemporary events and political context in the area now called China. |
| Jerusalem and the White House | Select the burning of the White House and inspect contemporary Jerusalem, including its political context and relevant developments. |
| Alexander in Bactria | Select a documented episode of Alexander's time there, locate Bactria, and fade present-day borders and labels over its historical extent. |
| Comparing lives | Pin two people with overlapping lives, move through time, and compare their ages and documented locations. Show unknown locations explicitly. |

Historical regions, cities and political territories must remain distinct. Modern countries can help visitors orient themselves, but should not be projected backwards as though they always existed.

## First version

The proposed main view combines a timeline, a map and a details panel. Selecting a date or interval updates the map and visible records. Selecting an event, person or place opens a short explanation with supporting sources.

Visitors can:

- Pan and zoom through time, or enter a date directly.
- Search the included people, places and events by name.
- Compare contemporary events across selected regions.
- Pin people and see their lifespans, ages and known locations at the selected time.
- Select historical areas and adjust the visibility of present-day borders and labels.
- Follow links between records, inspect sources and share a URL preserving their current view.

The prototype should use the five scenarios as entry points so that people have somewhere useful to start. Clearly label which periods and regions have coverage. An empty result means we have no matching content, not that nothing happened.

For the first version, defer conversational AI search, accounts, personal collections, public editing, a native app, automatic ingestion at scale and continuous reconstructions of every border or journey. The example questions can be answered through navigation and curated starting points before we build natural-language question answering.

## Historical content and evidence

The first research task is to assemble a small content pack for the scenarios. A provisional ceiling of about 100 records should keep the work bounded; reduce it if fewer records can prove the experience. Include surrounding context so comparisons are meaningful.

Each record needs a stable identifier, a short explanation and sources. The initial model should cover:

| Record or claim | Information needed |
| --- | --- |
| Event | Date or interval, locations, participants and related records |
| Person | Birth and death information, names and relevant relationships |
| Reign or role | Person, office or title, polity and period held |
| Place | Names over time, place type and geographical references |
| Person's location | Person, place, supported time interval and evidence |
| Historical area | Geometry, period of validity, interpretation and uncertainty |
| Source | Citation, link, supported claims, attribution and reuse information |

Represent exact, approximate, disputed and unknown dates explicitly. Keep an event's duration separate from uncertainty about when it occurred. Support BCE and CE, document the calendar convention and verify calculations across the boundary. Birth-date uncertainty must carry through into displayed ages.

Store locations as dated claims. Do not fill gaps in a person's whereabouts or draw an apparently factual journey between isolated observations. Historical boundary shading should communicate approximate extent; only offer a dated outline where there is sufficient evidence and permission to reuse it.

Research potential sources for both historical reliability and usable licences. Code, written summaries, imported data, maps and images may need different terms. Record provenance as content is added. Licence selection follows this audit.

Selection should consider consequences, usefulness for comparison and geographical breadth. Review coverage by region and period so that availability of familiar material does not silently determine the whole product.

## Delivery sequence

| Stage | Work | Completion condition |
| --- | --- | --- |
| 1. Content feasibility | Research the five scenarios, assemble representative records and one usable historical area, record evidence and reuse constraints. | Each scenario has enough supported content to build, or a clearly documented gap and revised scope. |
| 2. Interaction prototype | Sketch and prototype date navigation, regional comparison, pinned lives and the historical/modern map control. Use the researched content. | Someone unfamiliar with the design can work through the scenarios without being coached through the controls. |
| 3. Technical foundation | Choose the web and mapping tools against the prototype's needs; establish the repository, data format and validation. | A small working example handles uncertain dates, overlapping lives, dated locations and a historical overlay. |
| 4. Working first version | Connect the timeline, map, search, details and shareable views; add the remaining scenario content. | All five scenarios work together in the application, with sources accessible from the relevant claims. |
| 5. Public preview | Check accessibility, small-screen behaviour, performance, content attribution and contributor documentation; publish a preview. | Visitors can explore unaided and contributors can run the project and propose a documented correction. |
| 6. Expand coverage | Add reviewed collections across further regions and periods; use observed visitor difficulties to guide improvements. | Each addition passes the same evidence and data checks and improves useful coverage. |

Stages 1 and 2 should inform each other. The data format and technology choices remain provisional until we have tested the awkward cases. Estimate implementation effort after those stages, when the content and map constraints are clearer.

## Engineering and release requirements

Keep historical records separate from display code so that content can be reviewed and corrected without changing application logic. Begin with version-controlled structured data if the prototype supports it; introduce a database or server when a demonstrated requirement calls for one.

Test the parts where incorrect behaviour would mislead a visitor: BCE/CE transitions, uncertain ages, interval overlap, reign matching and location validity. Validate missing references and malformed records. Check that a shared URL restores the same exploration state.

Provide keyboard and touch alternatives to dragging. The timeline and map need an accessible list or text equivalent, readable labels and controls that do not depend on colour alone. On smaller screens, allow visitors to switch between map and timeline while preserving the selected date and records.

Before public release, add setup instructions, an explicit code licence, content and attribution guidance, contribution rules and a correction process. Contributions should arrive through review, including changes to historical claims. Use descriptive Git branch names such as `feature/` or `fix/`; never use `codex` in a branch name.

## First work package

Start with a content feasibility pack for the five scenarios and a rough layout of the linked timeline and map. Resolve three questions before building the full interface:

1. Can we source and reuse enough evidence to answer each scenario honestly?
2. Can visitors understand date ranges, uncertain locations and approximate boundaries without a long explanation?
3. Can the same navigation work for events, lives and places without overcrowding the screen?

The next concrete deliverable is that researched content pack, with a proposed initial data format and sketches showing how each scenario would work.
