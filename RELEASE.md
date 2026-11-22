# Manual beta release to A Small Orange

The GitHub repository stays private. Production hosting will be A Small
Orange, using the domain historica.online. Do not enable GitHub Pages or add
CI workflows. Builds and verification run manually on the Mac.

Run `npm run build:site`. This generates the evidence and coverage assets,
runs tests and prepares the static website in `docs/`. The folder name is
retained as a staging directory; it does not imply GitHub Pages hosting.
`npm run package:site` also produces `release/historica-site.zip` for upload.

Upload the archive contents into the document root assigned specifically to
historica.online. Confirm that root in the hosting account before uploading;
do not assume the account's primary public_html directory is the right target.
Back up any existing site files before replacement. Upload only the static
site, never the Git repository, research inputs, local configuration or keys.

Story's docs/HOSTING.md records explicit FTPS at ftp.example.com:21,
user deployment-account@example.com, with verified TLS, encrypted data and passive mode.
The password was entered through a hidden prompt and was not saved. The FTP
login root is /; /other-site-root serves sproates.net and must not be overwritten
with historica. Preserve all existing sites, .htaccess and email configuration.

Hosting setup still requires authenticated access and confirmation of
historica.online's assigned document root and hosting DNS target. Do not infer
that domain binding from an FTP directory name. Inspect the hosting account
before choosing the upload destination or DNS records.
Preserve unrelated mail and verification records at GoDaddy. Once the domain
resolves to the hosting account, enable its HTTPS certificate and verify the
home page, search, source links, coverage page and bookmarked views.

The source of truth is `web/`; do not edit generated files in `docs/`.
The site requires static file serving only, with no database or application
server. Socrates remains the default; Focus paths and optional query parameters preserve exploration state.

## Current content

100 focus entries; 69 individually source-checked statements. Checks are
AI-assisted, not independent expert review. Original prototype fields still
await claim-level review. No regional coverage package is claimed complete.
Large gaps remain, including Oceania and much of Africa and the Americas.

## Confirmed hosting configuration

Ian created the separate domain root `/hosting-account/historica.online` and
confirmed the shared website IP `192.0.2.1`. GoDaddy authoritative DNS
returns that address for `historica.online`, TTL 600 seconds; `www` is a CNAME
to the apex. The FTP folder is `/historica.online`.

Run `python3 scripts/deploy-ftps.py` only for an authorised release. It prompts
for the password without echo, verifies TLS, validates local release hashes,
checks only the approved folder, backs up replacements under ignored
`release/backups/`, uploads dependencies before HTML and verifies every file
by FTPS. It never deletes or mirrors remote files. No credentials are stored.
Run `python3 scripts/verify-hosted.py` afterwards to verify HTTPS asset bytes
and JavaScript MIME types. Certificate validation is always enabled.

## Initial upload — 22 November 2026

Uploaded 28 website assets plus the release manifest to `/historica.online`.
The folder initially contained only `cgi-bin`; it was left untouched. All 29
uploaded files were retrieved and hash-verified over FTPS. All 28 website
assets subsequently matched over HTTP, including JavaScript MIME checks.
Local upload record: `release/backups/20261122T191722Z/deployment.json`.
No remote file operation accessed a path outside `/historica.online`.

HTTPS verification is pending: the server currently presents a certificate
that does not cover historica.online. Ian has been asked to check this domain
and www in cPanel SSL/TLS Status and run AutoSSL if available. Do not force
HTTPS redirects until a valid certificate has been confirmed. No credentials
were written to project files, scripts, backups or Git.

## Proper focus paths

The release now includes a domain-local `.htaccess` generated from the
collection’s explicit routes. It rewrites recognised person, area, state,
city, period and event URLs to the app entry point without redirecting the
browser to index.html. Existing files/directories pass through; unknown URLs
remain 404s. Only `/historica.online/.htaccess` is in scope. The uploader refuses
to replace an unfamiliar existing routing file without review.

Local checks cover all 100 canonical paths, compact default URLs, customised
bookmark round-trips, invalid parameters, direct HTTP loads, unknown-route
404s and browser Back/Forward plus reload. No HTTPS redirect is added here.

### Deployment verification — 22 November 2026

Deployed the path routing release only inside `/historica.online`; backup and
upload record: `release/backups/20261122T193617Z/deployment.json`.
All changed files were retrieved and hash-verified over FTPS. All 29 public
assets matched over both HTTP and HTTPS. ASO's certificate is now valid for
historica.online; HTTPS verification succeeded without bypassing validation.
Live person, area with custom dates, and event paths returned 200; an unknown
person path returned 404. Browser navigation Alexander → Egypt preserved
356–323 BCE, and Back, Forward and reload restored the correct focus.
