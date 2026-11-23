"""Overlay generated pilot routes on the existing Wi-Fi preview only."""
from pathlib import Path
import json
import shutil
import argparse
root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview/web'
if not runtime.is_dir():
    raise SystemExit('Persistent preview is not installed.')
parser = argparse.ArgumentParser()
parser.add_argument('--incremental', action='store_true')
args = parser.parse_args()
output = root / ('release/static-incremental' if args.incremental else 'release/static-pilot')
routes = set(json.loads((root / 'web/data/routes.json').read_text()))
pages = sorted(output.glob('*/*/index.html'))
if not pages:
    raise SystemExit('No static pilot pages found; build them first.')
for page in pages:
    route = '/' + page.parent.relative_to(output).as_posix()
    if route not in routes:
        raise SystemExit(f'Unrecognised preview route: {route}')
for file in ('index.html', 'about/index.html'):
    if not (output / file).is_file():
        raise SystemExit(f'Missing static page: {file}')
for page in pages:
    shutil.copy2(page, runtime / 'pages' / f'{page.parent.name}.html')
shutil.copy2(output / 'index.html', runtime / 'index.html')
shutil.copy2(output / 'about/index.html', runtime / 'about.html')
print(f'Home, About and {len(pages)} static history pages are available on the existing Wi-Fi preview. Production unchanged.')
