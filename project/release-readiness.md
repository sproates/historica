# Sustainable version: review and release

This is the finish line for the current refactor, not a new optimisation backlog. The consolidated preview replaces the sequence of small migration PRs.

## Implemented

- Node 26, strict TypeScript application code and individual Markdown/YAML history records.
- Astro-generated home, About, privacy, research coverage and 230 history pages; one source for published HTML.
- Incremental page generation and verification, documentation-only CI shortcut, checksummed portable staging packages.
- Compact home search and assembled explorer data; evidence loaded by history and cached. Source records, dates, relationships and Bactria geometry preserved.
- Shared focus transitions for navigation and bookmarks, with snapshot isolation for Back.
- Shared visual tokens, timeline-led desktop/phone layout and persistent light/dark/system appearance.
- Production-only optional analytics loader, excluded from local and staging hosts.
- Protected main, PR checks and an existing retained-artifact staging restore workflow.

## Review gates

1. Ian approved the Chronology restyle: sans-serif typography, slate/cobalt colours, timeline H logo and light/dark modes. The local preview also includes requested map identification: hover/focus labels and an explicit Explore button after selecting a marker. These changes were merged in PR #41 and deployed to GitHub Pages staging; production remains unchanged.
2. Historica’s Cloudflare Web Analytics site is configured for manual installation, and its public token is stored in the GitHub repository variable `HISTORICA_ANALYTICS_TOKEN`. A production package was verified with the token; previews exclude it. SPA measurement is deliberately off, so document visits are counted rather than in-page focus changes. The remaining step is deployment with the approved release and confirmation of real traffic in Cloudflare.
3. Ian approved public visibility and the repository is now public. Main remains protected; the original archive remains private. The production domain and HTTPS cutover are still pending. Do not alter other Cloudflare projects.
4. Promote the reviewed artifact, verify public routes and HTTPS, and rehearse restoring the retained release. Keep the current live site available throughout the hosting transition.

## Deliberate boundaries

The browser still loads the full assembled history graph to compare any place or date immediately. Per-region loading is optional future work, not a release requirement. Evidence is already loaded on demand. Customised bookmarks can briefly show the static default while controls initialize; default routes do not depend on JavaScript to show their content.

Earlier campaign links retain a small isolated compatibility view and its tests. Build utilities use JavaScript and the preview service uses Python; the TypeScript requirement applies to the application, not every maintenance script. Evidence authoring remains in reviewed source packs; it is not a database migration requirement.

No further architecture rewrite is required before reviewing this version. Fix concrete defects found during review; defer optional enhancements until after release.

## Consolidated verification

Local verification passed 202 application/build tests and 15 static checks across all 234 pages. The packaged artifact contains 541 files with 4,259 checked local references. Browser review covered 390px phone and desktop layouts, light/dark/system selection, the timeline beside the map, research-page contrast, Alexander → Egypt with retained dates, and browser Back. Stylesheet URLs include their content hash after the browser check exposed stale light-only CSS.

These checks establish a reviewable preview, not Ian's visual approval or a production deployment. The repository is public; the current live site is untouched.

The appearance dropdown is now a moon toggle. The privacy page distinguishes cookie-free analytics from the local storage used for appearance preferences and is linked beside research coverage in the footer. Both changes are included in the same preview PR.
