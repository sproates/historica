"""Install the per-user Historica Wi-Fi preview; no administrator access needed."""
import os
from pathlib import Path
import plistlib
import shutil
import subprocess

root = Path(__file__).resolve().parent.parent
runtime = Path.home() / 'Library/Application Support/Historica/preview'
runtime.mkdir(parents=True, exist_ok=True)
subprocess.run([shutil.which('python3'), str(root / 'scripts/sync-preview.py')], check=True)
label = 'net.sproates.historica-preview'
service = f'gui/{os.getuid()}/{label}'
plist = Path.home() / 'Library/LaunchAgents' / f'{label}.plist'
logs = Path.home() / 'Library/Logs/Historica'
logs.mkdir(parents=True, exist_ok=True)
plist.parent.mkdir(parents=True, exist_ok=True)
configuration = {
    'Label': label,
    'ProgramArguments': [shutil.which('python3'), str(runtime / 'preview-server.py'),
                         '--bind', '0.0.0.0', '--port', '4173', '--directory', str(runtime / 'web')],
    'WorkingDirectory': str(runtime),
    'RunAtLoad': True,
    'KeepAlive': True,
    'ThrottleInterval': 10,
    'StandardOutPath': str(logs / 'preview.log'),
    'StandardErrorPath': str(logs / 'preview-error.log'),
}
subprocess.run(['launchctl', 'bootout', service], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
with plist.open('wb') as output:
    plistlib.dump(configuration, output)
subprocess.run(['launchctl', 'bootstrap', f'gui/{os.getuid()}', str(plist)], check=True)
host = subprocess.check_output(['scutil', '--get', 'LocalHostName'], text=True).strip()
print(f'Persistent preview: http://{host}.local:4173/')
print(f'Status: launchctl print {service}')
print(f'Logs: {logs}')
