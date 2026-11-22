"""Serve the static app with the same explicit focus routes as Apache."""
import argparse
import functools
import http.server
import json
from pathlib import Path
from urllib.parse import urlsplit
parser=argparse.ArgumentParser()
parser.add_argument('--bind',default='127.0.0.1')
parser.add_argument('--port',type=int,default=4173)
parser.add_argument('--directory',default='web')
args=parser.parse_args()
class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        route=urlsplit(self.path).path.rstrip('/')
        routes=json.loads((Path(args.directory)/'data/routes.json').read_text())
        if route in routes:self.path='/focus.html'
        if route=='/about':self.path='/about.html'
        if urlsplit(self.path).path=='/.htaccess':
            self.send_error(403);return None
        return super().send_head()
http.server.ThreadingHTTPServer((args.bind,args.port),functools.partial(Handler,directory=args.directory)).serve_forever()
