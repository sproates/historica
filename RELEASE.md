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

Hosting setup still requires the account's control-panel URL or server
hostname, authenticated access, the domain's assigned document root and its
hosting DNS target. Inspect the actual account before choosing DNS records.
Preserve unrelated mail and verification records at GoDaddy. Once the domain
resolves to the hosting account, enable its HTTPS certificate and verify the
home page, search, source links, coverage page and bookmarked views.

The source of truth is `web/`; do not edit generated files in `docs/`.
The site requires static file serving only, with no database or application
server. Socrates remains the default; URL fragments preserve exploration state.

## Current content

100 focus entries; 69 individually source-checked statements. Checks are
AI-assisted, not independent expert review. Original prototype fields still
await claim-level review. No regional coverage package is claimed complete.
Large gaps remain, including Oceania and much of Africa and the Americas.
