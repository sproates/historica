# GitHub Pages cutover preparation

23 November 2026. Live production remains on ASO. No DNS or production-domain change has been made.

## Prepared

- Physical static directories for all 230 history routes and About, with the existing pages retained for compatibility.
- Root and repository-subpath support for bookmarks, search, links and assets.
- A staging build with noindex metadata and a separate production build option.
- A real 404 page, no Apache rules, and a clean output directory on each build.
- Read-only verification with an explicit internal-documentation shortcut and seven-day artifact retention. A separate, branch-restricted staging job promotes the verified artifact and refuses deployment if a custom domain is attached.
- The previously uncommitted bookmark fixture update is included with route tests; it adds the new year/comparison fields to the expected state.

## Gates before hosting or DNS cutover

1. Complete: GitHub accepted Pages configuration for the private repository at `https://sproates.github.io/historica/`. No custom domain is attached and repository visibility is unchanged.
2. Complete: 116 tests passed locally and in GitHub Actions. The Wi-Fi artifact under `/historica/` passed browser checks for search, bookmarked year/comparison state and direct refresh.
3. Complete: staging is deployed at https://sproates.github.io/historica/ from the verified GitHub Actions artifact. HTTPS checks passed for home, About, history routes and scripts; the directory redirect retains bookmark queries, and unknown routes return 404. There is no custom domain. The public apex still resolves to ASO; `www` aliases the apex.
4. Rehearse rollback and the HTTPS transition. GitHub documents that custom-domain certificate provisioning starts after its DNS check succeeds. Merely leaving the ASO certificate in place does not secure requests arriving at GitHub. Establish a tested transition before changing website DNS.
5. Record the exact DNS rollback values locally, synchronise the final content, then perform the agreed cutover. Keep both origins available throughout propagation and the observation period.
6. Reclaim only Historica's ASO storage after acceptance, retaining an off-host recovery copy.

Sources: [GitHub Pages HTTPS provisioning](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), [Pages API](https://docs.github.com/en/rest/pages/pages).

The larger TypeScript, data and static-rendering refactor is described in [the sustainability plan](../SUSTAINABILITY-PLAN.md). This preparation removes the hosting dependency without attempting that rewrite at the same time.

Implementation: [preparation PR](https://github.com/sproates/historica/pull/1). First successful staging deployment: [GitHub Actions run](https://github.com/sproates/historica/actions/runs/45155742618). The remaining cutover work starts at gate 4; production traffic has not moved.
