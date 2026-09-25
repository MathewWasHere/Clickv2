"""Dev server for the preview: disables HTTP caching so the live preview always shows the latest files.
Stays alive and logs requests."""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))
        sys.stderr.flush()

if __name__ == '__main__':
    PORT = 8080
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    sys.stderr.write(f"Serving on http://0.0.0.0:{PORT} from {__import__('os').getcwd()}\n")
    sys.stderr.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
