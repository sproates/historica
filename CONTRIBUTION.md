# Working on Historica

Historica is an open source site for visualising history. People should be able to follow a person, place, period or event, see what was happening elsewhere and inspect the sources behind the account.

Keep contributions focused on something useful to a visitor or someone maintaining the project. A small correction, a well-sourced connection or a clearer interaction can be more useful than a large new feature.

## Choose the right starting point

- For historical content, read [Adding facts](project/adding-facts.md). It covers research, evidence records, dates, geography and the files to change.
- For app structure and local setup, start with the [README](README.md).
- For publishing and recovery, use [RELEASE.md](RELEASE.md).
- For working rules, including preview approval, read [AGENTS.md](AGENTS.md). Earlier planning documents describe decisions at the time; the current release instructions describe the live hosting and pipeline.

Check existing records, issues and open PRs before starting. For a substantial feature or architectural change, explain the problem and proposed scope first so we don't build competing solutions. Straightforward fixes don't need a separate proposal.

## Run it locally

Use Node.js 26 as pinned in `.node-version`, and Python 3. Release archive checks also use the `zstd` command.

```sh
npm ci
npm start
```

The local server uses port 4173. `npm run start:lan` makes it available to devices on the same network. Use your computer's network address or `.local` hostname on your phone.

On a Mac, `npm run preview:install` sets up the persistent preview. Install it once, then use `npm run preview:sync` to refresh it. The Mac must be awake and connected to Wi-Fi. Don't restart or reinstall the service for ordinary edits.

## Work in the source files

Application code is TypeScript under `src/`, with Astro pages, layouts and components. Browser startup modules are in `src/entrypoints/`. Shared styles and assets live in `web/`; browser JavaScript in `web/generated/` is compiled output.

Historical entries are Markdown files under `content/histories/`. YAML packs organise their relationships and dated places. Sources, claims and evidence reviews live under `research/`. Keep facts and their uncertainty separate from how we display them.

Edit the source and regenerate the output. Don't maintain a second implementation in generated files, bundle unrelated refactors into a small fix or commit local deployment settings, credentials and build artifacts.

## Use a branch and a PR

Use descriptive names such as `feature/compare-lives`, `fix/map-labels` or `docs/adding-facts`. Don't use `codex` in a branch name.

Main is protected. Changes arrive through a PR with a passing `verify` check; don't push directly to main or bypass protection. Keep the branch up to date and resolve review comments before merging.

Explain the problem, what changes for the user and how you checked it. Note any material limitation. For a visible change, include the preview link or screenshots that show the result. Keep the description proportionate to the change.

## Check what changed

Use the smallest set of checks that gives useful confidence. A documentation edit needs a check of its wording, links and commands. A fact update needs evidence and data checks. Shared app logic, routing or build changes need broader verification.

Useful commands include:

```sh
npm run typecheck      # compile browser TypeScript and check build tooling
npm test               # build and run app, data and static-page checks
npm run preview:sync   # refresh the persistent local preview
```

Don't run all three automatically for every change. In particular, don't repeat a full local suite merely because CI will run, or rebuild an already verified package to publish it.

CI can reuse the successful PR package after merge when the source tree matches exactly. Sharing artwork has focused image and metadata checks when the changes qualify. Missing or mismatched retained files fall back to full verification. Recognised internal documentation changes skip site work; unfamiliar paths conservatively take the site-checking path.

## Preview and publish

Design, layout, navigation, interaction and visitor-facing editorial changes need Ian's approval on the persistent Wi-Fi preview before publication. Refresh the existing preview, give him its phone-accessible URL and describe the change. Once approved, publish that version without another approval round unless something has changed.

Historical data updates can be published after their relevant checks. If a change mixes data with unapproved design work, keep the pending design out of the data release.

A push or merge doesn't publish the site. Use the retained production package and the workflow in [RELEASE.md](RELEASE.md). Check the affected live page or asset after deployment. Keep wider audits separate from an ordinary release.

## Credit and reuse

Historica was created by [Ian Sproates](https://sproates.net/). Code uses the [MIT licence](LICENSE); original historical summaries and research use CC BY 4.0. Third-party material retains its own terms. Check [ATTRIBUTION.md](ATTRIBUTION.md) before reusing text, data, images or maps, and keep the attribution required by your sources.
