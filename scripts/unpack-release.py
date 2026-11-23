"""Extract a retained release archive, rejecting links and escaping paths."""
import pathlib
import subprocess
import sys
import tarfile

archive, destination = map(pathlib.Path, sys.argv[1:])
destination.mkdir(parents=True, exist_ok=True)
with subprocess.Popen(['zstd', '-dc', str(archive)], stdout=subprocess.PIPE) as decoder:
    try:
        with tarfile.open(fileobj=decoder.stdout, mode='r|') as bundle:
            for member in bundle:
                name = pathlib.PurePosixPath(member.name)
                if name.is_absolute() or '..' in name.parts or not (member.isfile() or member.isdir()):
                    raise ValueError('Unsafe release archive entry: ' + member.name)
                bundle.extract(member, destination, filter='data')
        if decoder.wait() != 0:
            raise ValueError('Release archive decompression failed')
    except BaseException:
        decoder.kill()
        raise
