# GitHub Pages cutover preparation

23 November 2026. Live production remains on ASO. DNS delegation has moved to Cloudflare; website records still point to ASO and remain DNS-only.

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

Implementation: [preparation PR](https://github.com/sproates/historica-private-archive/pull/1). First successful staging deployment: [GitHub Actions run](https://github.com/sproates/historica-private-archive/actions/runs/45155742618). The remaining cutover work starts at gate 4; production traffic has not moved.

## HTTPS preparation

Ian confirmed an existing Cloudflare account on 23 November. It is also used by other projects: no account-wide settings or unrelated resources may be changed. Ian signed in. A free Historica-only zone has now been prepared; no other project or account-wide settings were changed. All four scanned records are DNS-only, with the apex still pointing at ASO. Registrar nameservers have not changed. Before activation, compare the scanned A, www CNAME, _domainconnect CNAME and _dmarc TXT against the full GoDaddy zone. Assigned nameservers are recorded in Cloudflare, not applied at GoDaddy.

The first Cloudflare step is inspection of an existing `historica.online` zone, if present, and preparation of its DNS records without changing registrar delegation. Keep website records DNS-only and pointed at ASO during any nameserver transition. Cloudflare documents that Universal SSL can be issued while records are DNS-only after activation; only enable proxying once the certificate is active and the ASO origin passes strict TLS validation. Copy and verify the full DNS zone, including mail records and DNSSEC state, rather than assuming the visible website records are sufficient.

This establishes a certificate-ready edge while ASO still serves the site. The subsequent GitHub origin switch still requires a tested, strictly validated HTTPS upstream and correct host/path handling. A Cloudflare account alone does not prove that step. Do not change DNS or attach the production GitHub domain until that route is concrete and verified.

Reference: [Cloudflare Universal SSL activation](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/).

## Staging rollback

`Restore verified Pages staging` accepts the run ID of a successful push build from the verification workflow. It downloads that run's retained `historica-pages-<commit>` artifact, verifies its file checksums, packages the unchanged files and deploys them. The temporary `github-pages` upload isn't relied on as a retained release. It does not rebuild. It runs from main only and refuses a Pages destination with a custom domain attached. Bundles are retained for seven days; an expired artifact fails safely before deployment.

Rollback rehearsal passed on 23 November: [restoration run](https://github.com/sproates/historica-private-archive/actions/runs/45158198224) restored the original staging release from run 45155742618, verified file checksums and deployed without rebuilding. The restored Socrates route passed an HTTPS check with bookmark query preserved. Production still resolves through GoDaddy to ASO.

GoDaddy comparison completed on 23 November: all four transferable records match the prepared Cloudflare zone. The remaining three GoDaddy entries are provider-managed NS/SOA records. No MX records, forwarding or enabled DNSSEC were present. The pre-change values are saved under ignored `release/` for rollback. Ian explicitly confirmed the Historica-only nameserver switch. GoDaddy now shows the assigned Cloudflare nameservers as saved custom nameservers. DNS propagation and Cloudflare activation are pending; all imported records remain DNS-only and the website continues to point to ASO. Both Cloudflare authoritative servers serve the expected website records, and the ASO certificate still validates for historica.online. No other domain or account-wide setting changed.

## Cloudflare activation confirmed

23 November: Cloudflare is active and its Universal SSL certificate for historica.online and *.historica.online is Active (managed expiry 21 February 2027); a backup certificate is also issued. Public DNS resolves to ASO. Direct HTTPS checks against the ASO origin succeeded for both apex and www. Historica-only encryption mode is now Full (strict), verified after saving. Website proxying is still off. The next step is to enable proxying for the apex and www while retaining ASO as origin, then check live HTTPS and routes before any hosting move. Proxy activation and hosting cutover are paused pending repository cleanup and Ian’s explicit approval to make the repository public. Other zones and account-wide settings are untouched.

## Public-release prerequisite

Ian confirmed that the repository must be cleaned up and made public before the production move to GitHub Pages. Existing private-repository staging is only a rehearsal. Do not change repository visibility, enable website proxying or switch production hosting until this prerequisite is met and the release is explicitly approved.

Cleanup review must cover tracked files and Git history for credentials and private deployment details; generated output duplication (`docs/` and generated `web/pages/`); obsolete prototype assets and scripts; the README’s conflicting historical counts, hosting statements and no-CI instructions; current setup/release guidance; and code/content/third-party licence attribution. Preserve the live ASO deployment and rollback material while doing this work. History rewriting, if needed, requires a separate concrete decision after the audit.

## Fresh private repository staging

The original repository was renamed to historica-private-archive and archived privately with Actions disabled. The new private historica repository contains the sanitised history and cleanup work on main. No production DNS or custom-domain change was made.

In this session, pushes to the fresh repository did not produce visible push-triggered Actions runs. Explicit workflow dispatch did run successfully; the cause of absent push triggers has not been established. Do not describe automatic push CI as verified yet. The staging workflow now also accepts manual dispatch on feature/github-pages-preparation, with the same verification dependency, branch restriction, environment policy and no-production-domain guard. Manual dispatch on main remains verification-only.

An attempt to restore the manual verification artifact was correctly rejected because the restore workflow only accepts push-built releases. No deployment occurred from that attempt. The normal verification/staging workflow is being used instead.
