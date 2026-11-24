"""Build and copy this isolated prototype into the existing persistent preview."""
from pathlib import Path
import hashlib
import shutil
import subprocess

root = Path(__file__).resolve().parents[2]
source = root / 'design/world-explorer'
output = root / 'release/world-explorer'
subprocess.run(['npx', 'tsc', '--ignoreConfig', str(source / 'prototype.ts'), str(source / 'return-map.ts'), '--strict', '--target', 'ES2022', '--module', 'ES2022', '--moduleResolution', 'bundler', '--skipLibCheck', '--outDir', str(output)], cwd=root, check=True)
# Version every local module so a phone never combines old and new prototype code.
version = hashlib.sha256(b''.join((source / name).read_bytes() for name in ['prototype.ts','model.ts','style.css','index.html','return-map.ts'])).hexdigest()[:12]
js = (output / 'prototype.js').read_text().replace("'./model.js'", f"'./model.js?v={version}'")
(output / 'prototype.js').write_text(js)
(output / 'index.html').write_text((source / 'index.html').read_text().replace('BUILD', version))
shutil.copy2(source / 'style.css', output / 'style.css')
vendor = output / 'vendor'
vendor.mkdir(exist_ok=True)
for name in ['leaflet-src.esm.js','leaflet.css']:
    shutil.copy2(source / 'node_modules/leaflet/dist' / name, vendor / name)
shutil.copy2(source / 'node_modules/leaflet/LICENSE', vendor / 'LICENSE')
target = Path.home() / 'Library/Application Support/Historica/preview/web/design-preview/world-explorer'
for name in ['index.html','style.css','prototype.js','model.js','return-map.js']:
    shutil.copy2(output / name, target / name)
shutil.copytree(vendor, target / 'vendor', dirs_exist_ok=True)
# Use the prototype as the local homepage, without changing the production source.
preview_web = target.parents[1]
backup = preview_web.parent / 'home-before-map.html'
if not backup.exists():
    shutil.copy2(preview_web / 'index.html', backup)
shutil.copy2(output / 'index.html', preview_web / 'index.html')
# Add a return link to the existing generated history pages in the preview only.
for page in (root / 'web/pages').glob('*.html'):
    html = page.read_text()
    if 'data-static-history=' in html:
        html = html.replace('</body>', f'<script type="module" src="/design-preview/world-explorer/return-map.js?v={version}"></script></body>')
    (preview_web / 'pages' / page.name).write_text(html)
about = (root / 'web/about.html').read_text()
instructions = '<section><h2>Exploring the map</h2><p>Move around the map to see the histories available in each area. Tap a numbered place to open its entries, or search for a country or historical place.</p><p>Change the dates to explore a different period. On a phone, pull the results panel upwards to read more, and down to see more of the map. Open an entry for its details and sources; Back to the map restores where you were.</p><p>The background shows present-day geography. Historical locations can be approximate, and a gap on the map means our coverage is incomplete.</p></section>'
about = about.replace('<section><h2>What’s here so far</h2>', instructions + '<section><h2>What’s here so far</h2>')
(preview_web / 'about.html').write_text(about)
print(f'Preview refreshed ({version}): http://ians-macbook-pro.local:4173/?revision={version}')
