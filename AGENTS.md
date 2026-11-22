# Historica working rules

## Branch names
Never use `codex` in a Git branch name. Use descriptive `feature/…`, `fix/…` or `chore/…` names.

## Release workflow
- Data-only updates may be built, checked and deployed directly to historica.online without a separate design preview approval. This includes historical records, sources, relationships, dates and geographic data, plus generated assets/routes required for that data.
- Design, layout, navigation, interaction and visitor-facing editorial changes must first be available on the persistent local Wi-Fi preview. Give Ian the phone-accessible URL and describe the changes. Do not deploy those changes to production until Ian explicitly approves the preview or specifically requests that release.
- Treat mixed data/design changes as requiring preview approval. If publishing data while design work awaits approval, build a separate clean release containing only approved production code and the data changes. Never deploy pending design changes accidentally through a full-folder upload.
- Committing or pushing is not permission to deploy unapproved design changes.
- Keep the preview running beyond the agent session. Use the macOS LaunchAgent installed by `scripts/install-preview-service.py`, serving a refreshed copy of `web/` on port 4173 over the same Wi-Fi as the Mac. The Mac must be awake and connected. Provide a LAN or `.local` URL, never a 127.0.0.1 link for phone review.
- Run builds and verification manually on the Mac; do not add GitHub CI or enable GitHub Pages. Keep the repository private until instructed otherwise.
- Production FTPS operations must remain confined to `/historica.online`. Never store credentials in Git or project files.

Refresh the persistent preview after edits with `npm run preview:sync`. Files are copied to `~/Library/Application Support/Historica/preview/` so the background service does not depend on access to the Documents folder. This command never changes production.
