"""Package only the generated static site for manual hosting upload."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import hashlib
root = Path('docs')
manifest = json.loads((root / 'release-manifest.json').read_text())
files = [entry['path'] for entry in manifest['files']]
for entry in manifest['files']:
    assert hashlib.sha256((root / entry['path']).read_bytes()).hexdigest() == entry['sha256'], 'Run the build again: changed release asset'
Path('release').mkdir(exist_ok=True)
with ZipFile('release/historica-site.zip', 'w', ZIP_DEFLATED) as archive:
    for name in files + ['release-manifest.json']:
        archive.write(root / name, name)
print(f'Packaged {len(files)} site assets in release/historica-site.zip')
