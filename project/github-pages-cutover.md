# GitHub Pages hosting record

The production cutover completed on 23 November 2026. Historica is hosted on GitHub Pages behind Cloudflare. Earlier preparation instructions in this file have been replaced by the released configuration and recovery notes.

## Released configuration

The cleaned repository is public and main is protected. The original repository remains in a private archive. PR checks and main verification run automatically.

`historica.online` and `www.historica.online` use proxied CNAME records pointing to `sproates.github.io`. Cloudflare Full (strict) and Always Use HTTPS are enabled for Historica. Other domains, DNS records and account-wide settings were unchanged during the cutover.

The original cutover used [verified run 45242603802](https://github.com/sproates/historica/actions/runs/45242603802), published without rebuilding by [deployment 45244078415](https://github.com/sproates/historica/actions/runs/45244078415). HTTPS, history routes, bookmark queries, redirects and 404 responses were checked. The latest release is recorded in [release status](release-readiness.md).

## HTTPS and recovery

GitHub’s own custom-domain certificate was still absent when checked on 24 November 2026. Its Enforce HTTPS option is off. Public HTTPS is provided and enforced by Cloudflare. On 24 November Ian chose to retain this arrangement and leave the GitHub certificate setting alone. No certificate transition or DNS change is planned. Direct GitHub TLS with the `github.io` hostname and Historica Host header was validated during cutover.

The Historica-only transition Worker remains attached as a 503 splash fallback for origin failures. It does not replace successful responses or bypass TLS validation. Its configuration and DNS rollback values are retained locally under ignored `release/cutover/`. Do not change other Cloudflare projects or account-wide settings.

The old Historica files on ASO remain intact for recovery. Removing them is a separate housekeeping action after retaining an off-host recovery copy. Any operation on ASO must stay within Historica’s document root.

## Publishing and restoring a release

The production workflow accepts the run ID of a successful main push verification containing a retained production package. It checks the destination domain and package checksums, then deploys those files without rebuilding. Use a retained, verified production release for rollback.

The separate staging restoration workflow refuses to deploy where a custom domain is attached. Its earlier successful rehearsals established the recovery mechanism; staging is not the live destination.
