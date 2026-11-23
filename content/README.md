# Authored history records

All current explorer histories now live here. Each `histories/<id>.md` file contains YAML metadata followed by the historical description as prose. Keep the stable ID aligned with the filename. Preserve claim IDs, source links, uncertainty notes and null locations when editing.

The Markdown body currently feeds the existing plain-text description renderer. Paragraphs are preserved; headings, embedded HTML and other Markdown presentation features are not yet rendered. Full Markdown rendering belongs to the static-site migration.

`packs/<name>.yaml` groups history IDs, dated place associations and navigation connections. Its explicit `order` preserves the previous collection order. Each history belongs to exactly one pack. New pack files are discovered automatically; histories that are missing, duplicated or not assigned to a pack are rejected.

After editing:

```sh
npm run build:evidence
npm test
```

Commit the authored files. Generated compatibility assets are ignored build output. `research/evidence/*-exploration.json` and `web/data/reviewed-exploration.json` are generated from these records. Don't edit those JSON files directly. CI rebuilds these assets from source before testing. Build validation checks the complete assembled collection before writing them.

Evidence claims, sources and review decisions still live in `research/evidence/*-reviewed.json`. The prototype pack contains the 65 histories that previously came from JavaScript builders. This does not promote those histories to reviewed evidence status.

`prototype-compatibility.yaml` preserves the old 68-record ordering and the three historical versions superseded by reviewed records (Maurya, Pataliputra and Ashoka's reign). Those variants are only for the original prototype view and audit tools; current histories use their Markdown records. The generated `web/generated/content/prototype-data.js` keeps the existing runtime API working without hand-authored history in JavaScript.

The original `web/data/collection.json` still supplies the earlier campaign interface, source registry and map overlay. Migrating those supporting structures and the evidence packs remains separate work.
