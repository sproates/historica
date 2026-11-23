# Sustainable version: released

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

## Release status

1. Ian approved Chronology and the hosting cutover. The repository is public and main remains protected. The original archive remains private.
2. The production package from successful verification run `45242603802`, commit `8ef34471fa815619a4b0d2595b12e62b870769db`, was published without rebuilding by production deployment run `45244078415` on 23 November 2026.
3. `historica.online` and `www.historica.online` now use proxied CNAME records pointing to `sproates.github.io`. Other DNS records and Cloudflare projects were unchanged. Cloudflare Full (strict) and Always Use HTTPS are enabled. The old hosting files remain intact for recovery.
4. Live checks passed for the homepage, history routes, map identification and explicit navigation, retained bookmark dates, privacy, HTTPS redirects and 404 responses. The Cloudflare analytics beacon loads in the live browser; reporting is checked separately from script loading.
5. GitHub's own custom-domain certificate is not issued yet, so its Enforce HTTPS setting is unavailable. Public HTTPS is provided and enforced by Cloudflare. Keep the web records proxied. Direct GitHub TLS with the `github.io` hostname and Historica Host header was validated. The Historica-only transition Worker remains attached as a 503 splash fallback for origin failures; it does not replace successful responses or bypass TLS validation. Its configuration and DNS rollback values are retained locally under ignored `release/cutover/`.

## Deliberate boundaries

The browser still loads the full assembled history graph to compare any place or date immediately. Per-region loading is optional future work, not a release requirement. Evidence is already loaded on demand. Customised bookmarks can briefly show the static default while controls initialize; default routes do not depend on JavaScript to show their content.

Earlier campaign links retain a small isolated compatibility view and its tests. Build utilities use JavaScript and the preview service uses Python; the TypeScript requirement applies to the application, not every maintenance script. Evidence authoring remains in reviewed source packs; it is not a database migration requirement.

No further architecture rewrite is required before reviewing this version. Fix concrete defects found during review; defer optional enhancements until after release.

## Consolidated verification

Local verification passed 202 application/build tests and 15 static checks across all 234 pages. The packaged artifact contains 541 files with 4,259 checked local references. Browser review covered 390px phone and desktop layouts, light/dark/system selection, the timeline beside the map, research-page contrast, Alexander → Egypt with retained dates, and browser Back. Stylesheet URLs include their content hash after the browser check exposed stale light-only CSS.

These checks establish a reviewable preview, not Ian's visual approval or a production deployment. The repository is public and the reviewed version is live on GitHub Pages through Cloudflare.

The appearance dropdown is now a moon toggle. The privacy page distinguishes cookie-free analytics from the local storage used for appearance preferences and is linked beside research coverage in the footer. Both changes are included in the same preview PR.
