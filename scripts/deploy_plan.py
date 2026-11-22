"""Select unchanged assets from the last completed release manifest."""
import re
from pathlib import PurePosixPath

def unchanged_paths(local_files, previous):
    if previous.get('format') != 1 or not isinstance(previous.get('files'), list):
        raise ValueError('Invalid hosted release manifest; stop and inspect it.')
    hashes = {}
    for row in previous['files']:
        name, digest = row.get('path'), row.get('sha256')
        if not isinstance(name,str) or not name or PurePosixPath(name).is_absolute() or '..' in PurePosixPath(name).parts:
            raise ValueError('Invalid hosted manifest path.')
        if name in hashes or not isinstance(digest,str) or not re.fullmatch(r'[a-f0-9]{64}',digest):
            raise ValueError('Invalid hosted manifest hash or duplicate path.')
        hashes[name] = digest
    return {row['path'] for row in local_files if hashes.get(row['path']) == row['sha256']}
