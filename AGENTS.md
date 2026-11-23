# Historica working rules

## Branch names
Never use `codex` in a Git branch name. Use descriptive `feature/…`, `fix/…` or `chore/…` names.

## Speed from idea to deployment
- Keep the path from request to preview or deployment short. The local preview is the only extra approval step Ian requested; do not add process around it.
- For design or wording changes: edit, run checks proportionate to the change, refresh the existing Wi-Fi preview, and send Ian the link promptly. After approval, publish that version without another approval round or repeating completed checks unless something changed.
- For data-only changes: edit, run relevant data checks, and publish directly.
- Small edits need targeted checks, not repeated full builds, full test suites or whole-site audits. Run broader checks when shared logic, routing, build tooling or failures justify them.
- Deploy only changed files and required dependencies. Back up files being replaced and verify those uploads. Do not download every hosted file just to discover what changed; use release manifests to identify the differences.
- Keep full-site audits separate from ordinary releases. Do not make them a routine prerequisite for a small change.
- Reuse the persistent preview. Do not reinstall or restart it for ordinary content or style edits.
- Do not bundle unrelated improvements, refactors or tooling work into a simple request. Report a concrete tooling limitation honestly rather than claiming an optimisation is already implemented.

## Release workflow
- Data-only updates may be built, checked and deployed directly to historica.online without a separate design preview approval. This includes historical records, sources, relationships, dates and geographic data, plus generated assets/routes required for that data.
- Design, layout, navigation, interaction and visitor-facing editorial changes must first be available on the persistent local Wi-Fi preview. Give Ian the phone-accessible URL and describe the changes. Do not deploy those changes to production until Ian explicitly approves the preview or specifically requests that release.
- Treat mixed data/design changes as requiring preview approval. If publishing data while design work awaits approval, build a separate clean release containing only approved production code and the data changes. Never deploy pending design changes accidentally through a full-folder upload.
- Committing or pushing is not permission to deploy unapproved design changes.
- Keep the preview running beyond the agent session. Use the macOS LaunchAgent installed by `scripts/install-preview-service.py`, serving a refreshed copy of `web/` on port 4173 over the same Wi-Fi as the Mac. The Mac must be awake and connected. Provide a LAN or `.local` URL, never a 127.0.0.1 link for phone review.
- The sustainability phase now permits GitHub CI and preparation of GitHub Pages staging alongside the live ASO site. Keep manual local checks proportionate. Do not change production DNS, attach the production domain to Pages, remove ASO files or make the repository public as part of staging preparation. Keep the repository private until explicitly instructed otherwise.
- Production FTPS operations must remain confined to the confirmed Historica document root in the ignored local deployment configuration. Never store credentials in Git or project files.

Refresh the persistent preview after edits with `npm run preview:sync`. Files are copied to `~/Library/Application Support/Historica/preview/` so the background service does not depend on access to the Documents folder. This command never changes production.
