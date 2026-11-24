# Releases

Historica is hosted on GitHub Pages at https://historica.online, with Cloudflare providing public HTTPS and DNS. The repository is public and main is protected. Changes reach main through a PR and passing verification.

## Prepare a release

Use Node.js 26 and `npm ci`. Run checks appropriate to the change. Design, wording and interaction changes need Ian's preview approval before publication; data-only changes need the relevant checks. A commit or merge doesn't publish the site.

The source is under `src/`, `content/` and `research/`, with shared styles and assets in `web/`. Generated HTML, JavaScript and data aren't source files. `npm run preview:sync` rebuilds the affected pages and refreshes the persistent Wi-Fi preview. It doesn't change production.

A PR builds and verifies the production package once. After merge, main reuses it only when the source tree matches exactly, the original check passed, the artifact is intact and analytics configuration is unchanged. It also carries forward the verified incremental page cache. The release and cache are compressed together in a Zstandard archive so repeated page markup is stored once, rather than zipped separately for every file. Older flat artifacts remain usable for recovery. Missing or ineligible artifacts fall back to full verification.

Sharing artwork changes have a narrower path. Image files and image-URL-only changes to metadata use a verified main-branch package as their baseline. CI checks PNG dimensions, refreshes the image references and checks the resulting package, without installing dependencies, rebuilding pages or running app tests. Any other code or layout change takes the normal verification path.

Successful site verification retains these packages:

- `historica-verified-<source-tree>` contains the PR’s production files and, when built, its incremental page cache. It is retained for seven days.
- `historica-pages-<commit>` is only built for the staging branch, mounted at `/historica/` with noindex.
- `historica-production-<commit>` is the root-domain package, with analytics configured from the `HISTORICA_ANALYTICS_TOKEN` repository variable. It is retained for 90 days.

The production package is checked before upload. Internal documentation-only changes don't generate a new package.

## Publish or restore

Run **Deploy or restore Historica production** on main, supplying the successful verification run ID. It downloads that run's production package, checks its manifest and file hashes, and deploys the retained files without rebuilding. It only accepts successful main push runs from the verification workflow and refuses to deploy unless the Pages custom domain is exactly `historica.online`.

```sh
gh workflow run deploy-production.yml --ref main -f run_id=VERIFICATION_RUN_ID
```

Check the workflow result and the live homepage, affected routes and assets. Confirm redirects preserve bookmark queries, and check browser interactions when they changed. The first production release used verification run `45242603802` and deployment run `45244078415`.

To restore a previous release, use its successful verification run ID in the same workflow. The artifact must still be retained. Keep an off-host copy when a release needs to remain recoverable beyond the retention period. Do not claim that a production rollback was tested merely because staging restoration passed.

The old staging workflows refuse to deploy while a custom production domain is attached. Don't remove that guard or detach the domain just to run a staging test; use the persistent local preview.

## HTTPS and the hosting transition

Both web DNS records point to `sproates.github.io` through Cloudflare. Full (strict) is enabled, along with Always Use HTTPS. GitHub's own custom-domain certificate wasn't yet available at cutover; public HTTPS is provided by Cloudflare. Keep proxying enabled unless the replacement certificate has been checked.

A Historica-only transition Worker passes successful requests through and returns a non-cacheable 503 splash if the origin fails. It has no application data bindings or request logging. Its source, configuration and pre-cutover DNS values are retained locally in ignored `release/cutover/`. Ian chose to retain the Cloudflare arrangement on 24 November; no certificate transition is planned. Any removal of the fallback is a separate hosting change.

The previous hosting files remain untouched for recovery. Reclaim that storage only after acceptance and an off-host recovery copy. Never touch another site's document root. The [release record](project/release-readiness.md) contains the current state; older cutover documents are historical records.

## Persistent Wi-Fi preview

On macOS, `npm run preview:install` installs the LaunchAgent once. Refresh it with `npm run preview:sync`. It serves a copy from `~/Library/Application Support/Historica/preview/` on port 4173 and stays running after the terminal closes. The Mac must be awake and on the same network as the phone. Use its `.local` hostname or LAN address.

## Analytics

The application loads Cloudflare Web Analytics only on `historica.online`, with automatic SPA tracking disabled. It counts document visits rather than each in-page focus or filter change. Automatic Cloudflare injection is off to avoid loading the beacon twice. Local and staging previews exclude analytics. Other Cloudflare projects must remain untouched.
