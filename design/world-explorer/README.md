# World explorer prototype

Local interaction prototype on `feature/world-explorer-prototype`. Not part of the production build.

Preview: http://ians-macbook-pro.local:4173/design-preview/world-explorer/

The Mac must be awake and on the same Wi-Fi as the phone. The existing preview service keeps running after the agent session.

Uses the preview's existing `/data/browser-history.json` and `/data/ne_50m_admin_0_countries.json`. No new historical claims are added. See `project/world-explorer-plan.md` for matching limitations and the implementation plan.

To refresh this isolated prototype from the repository root:

```sh
npx tsc --ignoreConfig design/world-explorer/prototype.ts --strict --target ES2022 --module ES2022 --moduleResolution bundler --skipLibCheck --outDir release/world-explorer
mkdir -p "$HOME/Library/Application Support/Historica/preview/web/design-preview/world-explorer"
cp design/world-explorer/index.html design/world-explorer/style.css release/world-explorer/prototype.js "$HOME/Library/Application Support/Historica/preview/web/design-preview/world-explorer/"
```

This copies only the prototype into the existing preview. It does not build or publish the site. A normal preview sync may remove this isolated folder; repeat the commands afterwards if necessary.
