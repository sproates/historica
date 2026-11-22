"""Refresh the installed Wi-Fi preview from web/ without deploying production."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview'
if runtime.exists():
    shutil.copytree(root / 'web', runtime / 'web', dirs_exist_ok=True)
    shutil.copy2(root / 'scripts/preview-server.py', runtime / 'preview-server.py')
    print('Updated local Wi-Fi preview only.')
else:
    print('Persistent preview not installed; run scripts/install-preview-service.py first.')
