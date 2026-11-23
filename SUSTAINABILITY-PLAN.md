# Historica application sustainability plan

Draft for agreement, 23 November 2026. Baseline: `v0.0.1`.

The prototype is live. We now need an app that is straightforward to maintain, inexpensive to host and quick to change. Routine content updates should touch only the records and outputs they affect. Structural changes should be possible without breaking the live site or turning every release into a large exercise.

The proposed direction is GitHub Pages hosting, a strict TypeScript codebase, Astro static generation, structured files for historical content, and GitHub Actions for proportionate verification and deployment. Move hosting before the full refactor so that ASO storage is released early. Restyle once the page and interaction boundaries are established.

This document authorises no infrastructure changes by itself. It proposes the sequence for enabling CI, moving hosting and making the repository public. The existing release rules apply until the corresponding phase is agreed. Design changes still go through the persistent Wi-Fi preview.

## What we have now

The current app is framework-free JavaScript with a large imperative rendering module. It generates metadata and introductory HTML for 230 histories, then constructs most of the experience in the browser. Apache rules translate public paths into generated files. That routing cannot simply be copied to GitHub Pages.

Research is already divided into evidence packs, but build scripts contain explicit pack lists and combine them into large browser payloads. The migration must preserve claims, sources, reviews, relationships and dating qualifications, not just the visible descriptions.

The local published output is about 8 MB, `web/` about 7 MB and local release backups about 94 MB. These are local measurements, not an audit of ASO disk use. Removing duplicate generated files from Git and retaining fewer backups will help housekeeping, but neither substitutes for moving production off ASO.

## Hosting choice

Use GitHub Pages as the first choice. Its published-site limit is 1 GB, comfortably above the current build, although it isn't unlimited storage. Large future imagery and map datasets should have their own storage budget rather than being committed indefinitely to Git. Publish a complete static artifact through GitHub Actions, with no generated-site branch and no FTPS step. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

If the repository stays private during migration, confirm the account has a plan supporting private-repository Pages. Otherwise complete the public-repository preparation first. A private source repository does not make a normal Pages website private.

Cloudflare Pages is the fallback if GitHub Pages cannot meet the HTTPS cutover, routing or release requirements. It supports rollback to retained production deployments. This is an alternative hosting decision, not a second deployment system to build now. Cloudflare Web Analytics works independently of either host. [Cloudflare rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

## Architecture

Use Astro to generate complete default pages, with small TypeScript components for the map, timeline, search and comparison controls. Keep the historical calculations independent of the UI. We don't need a server, a runtime database or a new front-end framework for every component.

Each history should arrive with its introduction, initial comparison, timeline, map and source links in HTML. JavaScript adds interaction. Bookmarked query parameters restore a customised view on top of that default; we cannot pre-generate every possible combination of dates, people and map positions. Restore that state before revealing the interactive controls to avoid the current visible reset.

Proposed layout:

- `src/domain/`: historical dates, age estimates, overlap, geographic associations and relationships. Pure TypeScript with no DOM dependencies.
- `src/content/`: schemas, loaders, indexing and dependency tracking.
- `src/state/`: the single application state, URL encoding and backwards-compatible bookmark decoding.
- `src/components/` and `src/styles/`: page components, interaction controllers and shared design tokens.
- `src/pages/`: real static routes, home, about, coverage and error pages.
- `content/`: authored histories, claims, sources, relationships and geography.
- `scripts/`: small build, verification and release entry points.
- `tests/`: domain tests, data fixtures and representative browser journeys.
- `project/`: roadmap, architecture decisions, contribution guidance and release runbooks.

One state model must govern focus, time window, selected year, comparison, filters and map camera. Clicking a timeline entry, using browser Back and opening the equivalent bookmark must produce the same view. Preserve the accepted behaviour from `v0.0.1` before changing its presentation.

Adopt strict TypeScript, schema validation at input boundaries, one formatter and a small lint configuration. Pin the supported Node version, dependencies and CI actions. Add abstractions where they remove duplication or protect a domain rule; avoid a general-purpose framework inside the app.

## Historical data

Use one Markdown file with schema-checked YAML metadata per history. Keep prose as paragraphs rather than JSON strings. Store sources separately, with stable IDs reused by claims. Store claims and evidence as structured YAML files grouped by the history they describe, and relationships as records with stable endpoint IDs. Keep geometry in GeoJSON files with source, date applicability and licence information.

Stable IDs survive title changes. Slugs are separately managed, with aliases when a public route changes. Each fact keeps its provenance and review state. Dates distinguish lifespan, reign, event, archaeological phase and editorial window, with earliest/latest bounds and precision where supported. Missing location stays missing. The conversion must never manufacture precision.

Astro content collections can load Markdown and structured files with schemas. Use that capability rather than maintaining an explicit list of research packs in a build script. [Content collections](https://docs.astro.build/en/guides/content-collections/).

The authoring format and delivery format have different jobs. Generate compact JSON for the browser: a small search index, per-history detail and evidence, and regional/time indexes loaded when needed. Give generated assets content hashes. Don't fetch every source and every history before showing one page. A generated SQLite index may become useful for build-time queries at much greater scale; it isn't necessary for this migration.

Convert the current data mechanically, then compare IDs, counts, dates, claims, links and locations against the prototype. Flag conflicting records for review. No silent merging or loss of provenance.

## Incremental builds and verification

A content edit should invalidate its own page and all outputs that depend on it. For example, changing Alexander's dates can affect Aristotle's comparisons, period summaries, regional indexes, search and coverage. Adding a new history can affect pages which did not previously reference it.

Record a dependency manifest for every generated page and index. Include entity IDs, sources, incoming relationships, query membership, temporal and regional dependencies, templates and build configuration. For additions, removals and moved dates, invalidate the relevant old and new query ranges. Deletions must remove stale output. Global queries may legitimately invalidate many pages.

Cache keys use content and dependency hashes, toolchain versions and output-affecting configuration. Compare against the last successful build or deployed manifest, not just the previous commit. A missing, incompatible or untrusted cache triggers a clean build. Never use a pull request's untrusted cache as production evidence.

Astro's documented incremental static builds are currently experimental. Run a short feasibility exercise before relying on them: change a record, add an overlapping history, delete a route, edit a shared template and restore a cache on a fresh runner. Incremental output must match a clean build. If the feature is unsuitable, keep cached data processing and selective verification, and either accept a measured fast full HTML render temporarily or choose another generator before migration. Do not call a full render an incremental build. [Astro incremental builds](https://docs.astro.build/en/reference/experimental-flags/incremental-build/).

GitHub Pages still receives a complete artifact. Reuse unaffected generated files to assemble that artifact; do not promise a changed-files-only Pages upload. Build scope, test scope and deployment packaging are separate concerns.

| Change | Required verification | Build and deployment |
| --- | --- | --- |
| Internal roadmap or documentation | Lightweight formatting and repository checks | No site build, browser tests or deployment |
| Historical content and sources | Changed-record schemas; reference integrity; affected comparisons, dates and indexes | Rebuild affected pages and indexes; publish automatically after checks |
| Visitor-facing prose, About or home | Affected-page checks and preview | Publish the reviewed version after approval |
| Component, CSS or interaction | Type checking, relevant tests and representative desktop/mobile browser checks | Rebuild dependants; local design preview before publication |
| Shared dates, state, routing or schemas | Full fast domain suite, migration checks and broader browser journeys | Invalidate affected site-wide outputs |
| Dependencies, build scripts or CI | Clean build, full relevant checks, cache comparison where applicable | No reuse of incompatible verification results |
| Unknown or mixed changes | Treat as the wider-impact category | No optimistic shortcut |

Use an explicit internal-documentation allowlist. A Markdown history is site content, not a documentation shortcut. A required CI dispatcher always runs and reports which checks apply, so skipped workflows don't leave required checks waiting indefinitely. Production deployment jobs run only for authorised main-branch code, never with credentials exposed to pull requests.

Keep cheap whole-collection integrity checks where their cost is negligible. Skip repeated rendering and browser tests for proven unchanged pages. Test shared templates and representative states rather than opening hundreds of interchangeable pages. Run a clean-build comparison at structural milestones and on demand; routine content publication must not wait for a full audit.

Initial performance targets, to measure on the chosen runner: documentation checks under 30 seconds excluding queue time; warm content verification and build under 90 seconds; ordinary content publication within three minutes; structural verification within five minutes. These are targets, not current measurements or hosting guarantees. Report cache hits, affected pages and elapsed time so a slowdown has an explanation.

## Content workflow

A normal update is: edit a record, validate it locally, push, let CI identify the affected outputs, then deploy. It doesn't require a design approval or a full-site browser run. Provide one command for local content checking and one for refreshing the existing Wi-Fi preview.

Keep production content fixes moving during the refactor. Use one canonical content tree and a temporary compatibility adapter so both implementations consume the same records. Remove the adapter after cutover. Avoid maintaining two hand-edited copies of the historical collection.

A later browser editor can write to the same files if authoring becomes cumbersome. It is not a prerequisite for fast updates. Content still needs a small generation step because the public pages are static; avoid introducing a live database just to eliminate that step.

## UI restyle and dark mode

Keep the timeline central, with the map alongside it on wide screens and a deliberate mobile layout. Develop a distinct visual language around chronology, readable labels and geographic context. Avoid replacing the current design with a generic collection of cards.

Create shared tokens for spacing, typography, colour, borders and focus states. Add light, dark and system modes. Respect the system initially, persist an explicit choice and apply it before paint to avoid a theme flash. Test the map, timeline uncertainty patterns, controls and source panels in both themes; colour must not be the only way to convey meaning.

Start with home and one representative history, including the timeline/map, people comparison, evidence and empty states. Review on the existing Wi-Fi preview, then extend the agreed design to the rest of the site. Include keyboard navigation, reduced motion, readable zoom, touch gestures and contrast checks in acceptance.

## Releases and uninterrupted service

Build and verify an immutable artifact, then promote that same artifact. Don't rebuild after approval. Store the source commit, content schema version, checksums and verification result with the release. Serialise production promotions so an older run cannot overwrite a newer release. Cancel superseded builds, not a deployment already switching production.

Keep the old working site available while the next release builds. Retain the last few verified artifacts for rollback and a bounded set of older hashed assets so an already-open browser can finish loading its version. Add a polite reload path if a requested old asset is unavailable. Set retention limits rather than accumulating backups indefinitely.

A failed build never replaces production. Rollback means redeploying a known-good artifact, not rebuilding an old commit with today's dependencies. Rehearse this before moving the domain.

The target is no planned downtime. Neither DNS nor free hosting can guarantee universal availability. A splash page can cover planned application maintenance, but cannot appear through a DNS or TLS failure. If a maintenance window becomes unavoidable, serve a lightweight, self-contained status page through a working HTTPS endpoint with an explanation and retry link. Prefer leaving the working version live.

## Cutover from ASO

1. Prepare the repository for public use. Review current files and Git history for credentials and hosting information, audit asset and data licences, and decide the code and content licensing terms. Preserve `v0.0.1` and a private recovery copy. Any history rewrite and visibility change is a separate explicit action.
2. Prove the current prototype on GitHub Pages before the architectural rewrite. Generate physical `/person/alexander/index.html`-style routes, including About and coverage, with absolute or correctly based asset paths. Test current no-trailing-slash links, query bookmarks and the 404 page. No dependency on `.htaccess` or a client-side 404 routing trick.
3. Enable CI and Pages for that tested artifact. Use a staging hostname or the repository Pages address, accounting for the repository subpath. Keep staging out of search indexes and production analytics.
4. Inventory the current DNS records and save rollback values. Change only Historica's website records; preserve mail, verification and unrelated records. Confirm both apex and `www` behaviour, with `historica.online` remaining canonical. Verify domain ownership in GitHub before pointing traffic there.
5. Resolve the HTTPS transition before switching public traffic. Native Pages certificate issuance can depend on DNS reaching GitHub, so a direct DNS flip is not sufficient evidence of zero downtime. Rehearse a supported certificate-ready route. If that cannot be established, use a separately agreed Cloudflare edge transition with valid edge and origin certificates, or choose a host which supports the required cutover. Do not weaken TLS or hope a splash page will hide certificate errors.
6. Rehearse artifact promotion and rollback. Check direct links, refresh, assets, sharing metadata, search, bookmarks, map gestures and both hostnames. Agree a short content freeze for the final synchronisation only.
7. Reduce TTL in advance, wait out the previous TTL, synchronise the final content and switch website traffic. Keep ASO serving the same release during propagation. Verify HTTPS and routes through both paths and monitor failures. DNS rollback alone is not instant; the serving-layer rollback must already be understood.
8. After an agreed observation period, proposed as seven days with at least 48 hours of healthy traffic, archive one recovery copy off ASO and remove only Historica's old deployed files and obsolete backups there. Confirm the resulting disk saving. Do not remove another site's files, mail data or account-level configuration.

The cutover rehearsal is a go/no-go condition, not an excuse to migrate DNS before certificates are ready. Once the host migration is complete, normal releases no longer involve DNS changes.

## Cloudflare Analytics

Add Cloudflare Web Analytics to the shared production layout. It can run on GitHub Pages without moving DNS to Cloudflare. Exclude local and staging views and initialise the beacon only once. [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/).

Start with visits, popular histories and real-user performance. Verify how client-side focus changes are counted, and avoid recording every slider movement as a page view. Don't send search text, personal identifiers or customised comparison state as custom telemetry. Document what is collected in the site's privacy information. Check counts after a real production visit and make sure analytics failure cannot block the app.

## Branching and repository housekeeping

Keep `main` releasable. Use short branches such as `feature/static-routes`, `refactor/domain-typescript` and `chore/content-schema`, with small focused pull requests. No permanent development branch and no months-long rewrite branch. Integrate unfinished replacements behind a build-time switch which defaults to the production implementation.

Content updates can use small commits directly to main if that remains the fastest solo workflow; CI still gates publication. Structural work uses pull requests and required checks. Design approval happens on the Wi-Fi preview before its production version is merged or explicitly released. Don't accidentally publish pending design work through a later content merge.

Move generated `docs/`, route HTML, bundles and release manifests out of tracked source once CI owns generation. Keep authored research, provenance and useful migration history. Remove dead scripts and adapters after their replacements are working. Consolidate the roadmap and release instructions, document the folder structure and contribution commands, and add dependency/update policy and licence notices. Put plans under `project/`, since `docs/` currently means deployable output.

There is an existing uncommitted change in `tests/view-url.test.mjs`. Review and account for it at the baseline stage; don't silently discard it or claim the working tree is already clean.

## Delivery sequence

| Stage | Deliverable and completion condition | Indicative size |
| --- | --- | --- |
| 1. Baseline and repository preparation | Preserve prototype, resolve outstanding changes, record behaviour and performance, audit publication readiness, agree updated workflow rules | 1–2 PRs |
| 2. Hosting and release pipeline | Pages-compatible prototype, CI change classification, verified artifact deployment, rollback rehearsal, HTTPS cutover and ASO cleanup | 2–3 PRs plus cutover |
| 3. Types and canonical data | Strict domain model, schema-checked records, lossless conversion and compatibility adapter | 2–3 PRs |
| 4. Static application | Astro pages, isolated interactions, all current routes and bookmarks preserved, useful HTML before JavaScript | 2–3 PRs |
| 5. Incremental content delivery | Dependency-aware generation, targeted verification, reproducible clean-build comparison, measured fast content release | 1–2 PRs |
| 6. Restyle and analytics | Approved light/dark UI across representative states, responsive/accessibility checks and production analytics | 2–3 PRs |
| 7. Remove the prototype scaffolding | Old implementation and obsolete tooling removed, concise documentation, clean checkout builds and rollback verified | 1 PR |

Rough scope: 11–17 small PRs. Some work overlaps, particularly the data model and build-dependency experiment. The first stage should measure the baseline and settle the hosting/TLS and incremental-generator choices before we commit to implementation details. Release working stages as they are ready; don't hold the hosting move until the visual redesign is finished.

## Acceptance for the sustainable version

The site is served independently of ASO, every existing public history and bookmark still works, and the repository contains enough documentation to build and release from a clean checkout. Default pages contain meaningful static content, interactions have one consistent state model, and historical data retains its evidence and uncertainty.

A documentation edit causes no website deployment. A small content edit rebuilds and verifies its actual dependants, with a safe full-build fallback. A shared-code change receives the wider checks it needs. Clean and incremental output agree, deleted pages don't survive in caches, and rollback uses the original verified artifact.

The approved design works on phone and desktop in both themes, with no known release-blocking accessibility, functional or visual defects. Analytics is working without affecting page loading. Build and deployment times are recorded against the targets above. These are testable completion criteria for a maintainable app; “perfect and correct” should not become an unbounded refactoring project.

## Runtime decision

Use Node.js 26 for the refactored application, as requested by Ian on 23 November 2026. Align local development, the build tooling and GitHub CI on that version during the refactor. This does not change the current prototype runtime.
