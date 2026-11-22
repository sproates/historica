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

## Fast path from idea to release

For design or wording changes, edit the source, run proportionate checks,
refresh the existing Wi-Fi preview and send Ian the link. Once he approves,
publish that version. Do not add another approval step or repeat checks that
already passed unless the files changed or a new issue appeared.

For data-only changes, edit, run the relevant data checks and publish directly.
Do not bundle unrelated improvements into either workflow.

Small edits need targeted checks. Broader tests are appropriate for shared
logic, routing or build changes, or when a failure warrants them. A full-site
audit is a separate task, not a prerequisite for every release.

## Build and release tools

The source of truth is `web/`; do not edit generated `docs/` files directly.
Regenerate affected outputs and their dependencies before publishing. The
complete build command, `npm run package:site`, regenerates metadata, routes,
evidence and coverage, runs the full tests and prepares the release archive.
Use it when a complete rebuild is warranted, not as an automatic response
to every preview edit. No build command publishes.

The required deployment behaviour is incremental: compare release manifests,
upload only changed files and dependencies, back up replacements and verify
those uploads. Do not download the entire hosted site to identify changes.

The uploader compares the hosted release manifest with the local one, skips
unchanged assets, and backs up and verifies only replacements. The full
manifest is published last, after every changed file has passed verification.
An absent manifest requires an initial comparison; a malformed manifest stops
the release for inspection. Out-of-band server edits require a separate audit.

Run the uploader only for an authorised release. Backups and upload records
are saved under ignored `release/backups/`. Verify changed assets and affected
routes after upload. `scripts/verify-hosted.py` checks the full site and is
reserved for a full audit or a specific concern, rather than every release.
Keep TLS verification and the configured document-root restriction in place.

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
