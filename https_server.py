#!/usr/bin/env python3
import http.server
import ssl
import socketserver
import os

# 创建自签名证书
def create_self_signed_cert():
    if not os.path.exists('server.pem'):
        os.system('openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes -subj "/C=US/ST=CA/L=SF/O=Test/CN=localhost"')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == '__main__':
    create_self_signed_cert()
    
    PORT = 8443
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        # 创建SSL上下文
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('server.pem')
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"HTTPS Server running on https://0.0.0.0:{PORT}")
        print("Note: You'll need to accept the self-signed certificate warning")
        httpd.serve_forever()