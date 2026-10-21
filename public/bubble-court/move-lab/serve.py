"""Local-only, cache-free motion review server. No build or game backend needed."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # Iteration may span browser sessions; never mix old module caches with new art.
        for name in ("If-Modified-Since", "If-None-Match"):
            if name in self.headers:
                del self.headers[name]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    root = str(Path(__file__).resolve().parent)
    print("Motion lab: http://localhost:8788/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 8788), partial(PreviewHandler, directory=root)).serve_forever()
