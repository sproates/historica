# Authored history records

Use the [guide to adding facts](../project/adding-facts.md) for the current research, authoring and publication process. See [CONTRIBUTION.md](../CONTRIBUTION.md) for working on the app.

Each `histories/<id>.md` file contains YAML metadata followed by the historical description. Its filename and ID must match. Paragraphs are preserved, but headings, embedded HTML and Markdown links aren't rendered as rich description content.

`packs/<name>.yaml` groups history IDs, dated place associations and navigation connections. Its unique integer `order` determines collection order. Every history belongs to exactly one pack. New YAML packs are discovered automatically.

Evidence claims, sources and reviews live in `research/evidence/*-reviewed.json`. New evidence packs must be registered in `scripts/build-evidence.ts`. Generated exploration JSON, browser data and static pages are build output; don't edit them directly.

The prototype pack contains older records that aren't automatically reviewed evidence. `prototype-compatibility.yaml` preserves base record ordering and older versions needed by the assembly and audit tools. Reviewed Markdown records replace those versions in the current collection. The earlier campaign interface and generated prototype data module have been removed.

`web/data/collection.json` still supplies legacy supporting data, including source references and the Bactria outline. Don't use it as the destination for new historical entries.
