# Manual releases

Historica is hosted on a separate document root at its hosting provider.
Keep the repository private. Do not enable GitHub Pages or GitHub CI.
Builds and verification run manually on the Mac.

## What can be published

Data-only changes may be deployed after checks. Design, layout, navigation,
interaction and visitor-facing editorial changes must be reviewed on the
Wi-Fi preview and approved by Ian before publishing. Mixed changes follow
the design rule. Never include unapproved design work in a data release.
Use an isolated checkout if needed. See [AGENTS.md](AGENTS.md).

## Local configuration

Connection details belong in `.deploy-local.json`, which is ignored by Git.
Copy `.deploy-local.example.json` and set the hosting server, username and
confirmed remote document root. Do not put a password in that file. The
uploader requests it through a hidden prompt and keeps it in memory only.
The local hosting notes are under the ignored `release/` directory.

Only the configured Historica document root is authorised. Do not inspect,
modify or upload to any other site or hosting directory. TLS certificate
validation and encrypted data transfer must remain enabled.

## Build and release

The source of truth is `web/`; do not edit generated `docs/` files directly.
Run `npm run package:site` to generate metadata, routes, evidence and coverage,
run tests, and prepare the manifest and archive. No build command publishes.

Run `python3 scripts/deploy-ftps.py` for an authorised release. Backups and
upload records are saved under ignored `release/backups/`. Verify the live
site after upload with `python3 scripts/verify-hosted.py`, plus checks of the
changed routes and user flows. Do not bypass certificate validation.

## Persistent Wi-Fi preview

Run `npm run preview:install` once to install a per-user macOS LaunchAgent.
It starts at login and restarts after a crash, independently of agent sessions.
Run `npm run preview:sync` after edits. The service serves a copy of `web/`
from `~/Library/Application Support/Historica/preview/` on port 4173.

Use the Mac’s `.local` hostname or current Wi-Fi IP, followed by `:4173`.
The phone must be on the same network and the Mac must be awake. Find its
address with `ipconfig getifaddr en0`. No public tunnel or port forwarding
is required. Preview refreshes never modify production.

## Before making the repository public

Earlier commits contain hosting connection details. Removing them from the
current files does not remove them from Git history. Review and clean that
history before changing repository visibility. Never commit passwords,
local deployment configuration, backups or hosting notes.
