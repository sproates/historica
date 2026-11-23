"""Overlay the opt-in Astro pilot on the existing Wi-Fi preview only."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview/web'
if not runtime.is_dir():
    raise SystemExit('Persistent preview is not installed.')
shutil.copy2(root / 'release/static-pilot/person/alexander/index.html', runtime / 'pages/alexander.html')
print('Alexander static pilot is available on the existing Wi-Fi preview. Production unchanged.')
