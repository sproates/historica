# Manual beta release

Build on the Mac with `npm run build:site`. This validates and generates the
reviewed evidence and coverage assets, runs the tests, and copies the static
site into `docs/` with `.nojekyll` and a file hash manifest. No CI workflow is
used. Serve `docs/` locally to review exactly what will be published.

The source of truth is `web/`; do not edit generated files in `docs/`.
The site works at both a GitHub project path and a custom domain. Navigation
state uses URL fragments. Socrates remains the default page.

## First publication

1. Review the beta locally and agree that the private repository can become public.
2. Commit and push the reviewed source and generated `docs/` to `main`.
3. Make `sproates/historica` public. Set Pages to **Deploy from a branch**,
   branch `main`, folder `/docs`. GitHub performs its standard Pages deployment;
   there is no project Actions workflow or remote research/build pipeline.
4. Check `https://sproates.github.io/historica/`, including a bookmarked focus.
5. Verify domain ownership and configure `historica.online` in Pages before
   changing DNS. Keep the resulting `docs/CNAME` in subsequent releases.
6. At GoDaddy, replace conflicting apex records with GitHub Pages A records:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   Set `www` CNAME to `sproates.github.io` (no repository path). Preserve unrelated
   mail and verification records.
7. Wait for DNS and the GitHub certificate, then enable Enforce HTTPS and check
   apex, www, source links, the coverage page and bookmark restoration.

Publication and domain configuration are separate from the local build.

References: [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
[custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Content scope

This release has 100 focus entries: the original 68-entry prototype, ten
Britain/Ireland entries and 22 global overview entries (including the editorial
world overview). There are 69 individually source-checked statements, of which
43 were added in the global batch. Checks are AI-assisted, not independent
expert review. Original prototype fields still await claim-level review.
No regional coverage package is claimed complete. Large gaps remain, including
Oceania and much of Africa and the Americas. Missing entries do not mean that
nothing happened there. Historical dates, distances and boundaries have the
limitations described in the interface.
