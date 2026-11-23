# Authored history records

The reviewed exploration entries now live here. Each `histories/<id>.md` file contains YAML metadata followed by the historical description as prose. Keep the stable ID aligned with the filename. Preserve claim IDs, source links, uncertainty notes and null locations when editing.

The Markdown body currently feeds the existing plain-text description renderer. Paragraphs are preserved; headings, embedded HTML and other Markdown presentation features are not yet rendered. Full Markdown rendering belongs to the static-site migration.

`packs/<name>.yaml` groups history IDs, dated place associations and navigation connections. Its explicit `order` preserves the previous collection order. Each history belongs to exactly one pack. New pack files are discovered automatically; histories that are missing, duplicated or not assigned to a pack are rejected.

After editing:

```sh
npm run build:evidence
npm test
```

Commit the authored files and the generated compatibility assets. `research/evidence/*-exploration.json` and `web/data/reviewed-exploration.json` are generated from these records. Don't edit those JSON files directly. CI rejects stale compatibility assets. Build validation checks the complete assembled collection before writing them.

Evidence claims, sources and review decisions still live in `research/evidence/*-reviewed.json`. The 65 remaining prototype histories still come from the original collection and JavaScript builders. This migration moved 165 reviewed entries; it did not relocate all historical data or change any historical statement.
