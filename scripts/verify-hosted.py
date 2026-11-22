"""Verify manifest assets on historica's public host; never bypass TLS validation."""
import concurrent.futures
import hashlib
import json
import sys
import urllib.request
from pathlib import Path
base=sys.argv[1] if len(sys.argv)>1 else 'https://historica.online/'
assert base in ('http://historica.online/','https://historica.online/','http://www.historica.online/','https://www.historica.online/')
files=json.loads(Path('docs/release-manifest.json').read_text())['files']
def check(row):
    with urllib.request.urlopen(urllib.request.Request(base+row['path'],headers={'User-Agent':'Mozilla/5.0 (historica release verification)'}),timeout=30) as response:
        content=response.read()
        assert hashlib.sha256(content).hexdigest()==row['sha256'], 'Content mismatch: '+row['path']
        mime=response.headers.get_content_type()
        if row['path'].endswith('.js'):assert mime in ('application/javascript','text/javascript'), 'Invalid module MIME: '+mime
    return row['path']
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for name in pool.map(check,files):print('Verified '+name,flush=True)
print(f'All {len(files)} assets match at {base}')
