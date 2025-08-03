#!/bin/sh
# Debug entrypoint to test basic PORT binding

echo "=== DEBUG MODE: Testing basic PORT binding ==="
echo "PORT: ${PORT:-8000}"

# Create a simple Python HTTP server that just responds on PORT
cat > /tmp/debug_server.py << 'EOF'
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get('PORT', 8000))

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'DEBUG: Server is running on PORT ' + str(PORT).encode())

print(f"Starting debug server on PORT {PORT}...")
httpd = HTTPServer(('0.0.0.0', PORT), SimpleHandler)
print(f"Server listening on 0.0.0.0:{PORT}")
httpd.serve_forever()
EOF

# Run the debug server
exec python /tmp/debug_server.py