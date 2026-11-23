# GitHub Pages cutover preparation

23 November 2026. Live production remains on ASO. No DNS or production-domain change has been made.

## Prepared

- Physical static directories for all 230 history routes and About, with the existing pages retained for compatibility.
- Root and repository-subpath support for bookmarks, search, links and assets.
- A staging build with noindex metadata and a separate production build option.
- A real 404 page, no Apache rules, and a clean output directory on each build.
- A read-only verification workflow with an explicit internal-documentation shortcut and seven-day artifact retention. It does not deploy.
- The previously uncommitted bookmark fixture update is included with route tests; it adds the new year/comparison fields to the expected state.

## Gates before hosting or DNS cutover

1. Confirm GitHub Pages can be enabled while this repository remains private. The repository has no Pages site yet; the account-plan API did not return a plan. Do not change visibility or buy a subscription as a workaround without Ian's decision.
2. Run the verification workflow on the preparation pull request. Test the artifact on the existing Wi-Fi preview under `/historica/`, including query-preserving directory redirects, search, focus changes and refresh.
3. Configure and deploy staging only at the GitHub address, without a custom domain or production DNS changes. Use a separate explicit deployment workflow, promoting a verified artifact.
4. Rehearse rollback and the HTTPS transition. GitHub documents that custom-domain certificate provisioning starts after its DNS check succeeds. Merely leaving the ASO certificate in place does not secure requests arriving at GitHub. Establish a tested transition before changing website DNS.
5. Record the exact DNS rollback values locally, synchronise the final content, then perform the agreed cutover. Keep both origins available throughout propagation and the observation period.
6. Reclaim only Historica's ASO storage after acceptance, retaining an off-host recovery copy.

Sources: [GitHub Pages HTTPS provisioning](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), [Pages API](https://docs.github.com/en/rest/pages/pages).

The larger TypeScript, data and static-rendering refactor is described in [the sustainability plan](../SUSTAINABILITY-PLAN.md). This preparation removes the hosting dependency without attempting that rewrite at the same time.
