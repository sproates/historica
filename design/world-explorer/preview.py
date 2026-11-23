"""Build and copy this isolated prototype into the existing persistent preview."""
from pathlib import Path
import hashlib
import shutil
import subprocess

root = Path(__file__).resolve().parents[2]
source = root / 'design/world-explorer'
output = root / 'release/world-explorer'
subprocess.run(['npx', 'tsc', '--ignoreConfig', str(source / 'prototype.ts'), '--strict', '--target', 'ES2022', '--module', 'ES2022', '--moduleResolution', 'bundler', '--skipLibCheck', '--outDir', str(output)], cwd=root, check=True)
# Version every local module so a phone never combines old and new prototype code.
version = hashlib.sha256(b''.join((source / name).read_bytes() for name in ['prototype.ts','model.ts','style.css','index.html'])).hexdigest()[:12]
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
for name in ['index.html','style.css','prototype.js','model.js']:
    shutil.copy2(output / name, target / name)
shutil.copytree(vendor, target / 'vendor', dirs_exist_ok=True)
print(f'Preview refreshed ({version}): http://ians-macbook-pro.local:4173/design-preview/world-explorer/?revision={version}')
