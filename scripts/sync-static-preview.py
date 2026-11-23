"""Overlay generated pilot routes on the existing Wi-Fi preview only."""
from pathlib import Path
import json
import shutil
root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview/web'
if not runtime.is_dir():
    raise SystemExit('Persistent preview is not installed.')
output = root / 'release/static-pilot'
routes = set(json.loads((root / 'web/data/routes.json').read_text()))
pages = sorted(output.glob('*/*/index.html'))
if not pages:
    raise SystemExit('No static pilot pages found; build them first.')
for page in pages:
    route = '/' + page.parent.relative_to(output).as_posix()
    if route not in routes:
        raise SystemExit(f'Unrecognised preview route: {route}')
for page in pages:
    shutil.copy2(page, runtime / 'pages' / f'{page.parent.name}.html')
print(f'{len(pages)} static history pages are available on the existing Wi-Fi preview. Production unchanged.')
