"""Refresh the installed Wi-Fi preview from web/ without deploying production."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview'
if runtime.exists():
    shutil.copytree(root / 'web', runtime / 'web', dirs_exist_ok=True)
    # Remove retired campaign assets and handwritten entry points from older previews.
    for name in ('campaign.html', 'app.js', 'model.js', 'timeline.js', 'style.css', 'timeline.css', 'focus-model.js', 'focus-app.js', 'coverage-app.js', 'home.js', 'site-path.js'):
        (runtime / 'web' / name).unlink(missing_ok=True)
    privacy = runtime / 'web/privacy'
    privacy.mkdir(exist_ok=True)
    shutil.copy2(root / 'web/privacy.html', privacy / 'index.html')
    # These directories contain generated files only; do not retain retired output.
    for folder in ('pages', 'generated', 'data/evidence'):
        source = root / 'web' / folder
        target = runtime / 'web' / folder
        for file in target.rglob('*'):
            if file.is_file() and not (source / file.relative_to(target)).is_file():
                file.unlink()
    shutil.copy2(root / 'scripts/preview-server.py', runtime / 'preview-server.py')
    print('Updated local Wi-Fi preview only.')
else:
    print('Persistent preview not installed; run scripts/install-preview-service.py first.')
