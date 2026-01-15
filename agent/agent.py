#!/usr/bin/env python3
"""
Simple Remote Control Agent
Runs on target laptop and listens for power commands
"""
import os
import sys
import subprocess
import platform
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import socket

# Configuration
PORT = 8765
DEVICE_TOKEN = "DEVICE_TOKEN_PLACEHOLDER"  # Will be generated on first run

class CommandHandler(BaseHTTPRequestHandler):
    """Handles incoming power control commands"""
    
    def do_POST(self):
        """Handle POST requests for power commands"""
        if self.path == '/command':
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                command = data.get('command')
                token = data.get('token')
                
                # Verify token
                if token != DEVICE_TOKEN:
                    self.send_response(401)
                    self.end_headers()
                    self.wfile.write(b'{"error": "Invalid token"}')
                    return
                
                # Execute command
                if command == 'shutdown':
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'{"status": "shutting down"}')
                    self.execute_shutdown()
                    
                elif command == 'restart':
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'{"status": "restarting"}')
                    self.execute_restart()
                    
                elif command == 'sleep':
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'{"status": "sleeping"}')
                    self.execute_sleep()
                    
                else:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error": "Unknown command"}')
                    
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path == '/status':
            # Health check endpoint
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            hostname = socket.gethostname()
            response = {
                "status": "online",
                "hostname": hostname,
                "platform": platform.system(),
                "token": DEVICE_TOKEN
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def execute_shutdown(self):
        """Execute system shutdown"""
        system = platform.system()
        if system == "Windows":
            subprocess.Popen(['shutdown', '/s', '/t', '0'])
        elif system == "Linux":
            subprocess.Popen(['sudo', 'shutdown', '-h', 'now'])
        elif system == "Darwin":  # macOS
            subprocess.Popen(['sudo', 'shutdown', '-h', 'now'])
    
    def execute_restart(self):
        """Execute system restart"""
        system = platform.system()
        if system == "Windows":
            subprocess.Popen(['shutdown', '/r', '/t', '0'])
        elif system == "Linux":
            subprocess.Popen(['sudo', 'reboot'])
        elif system == "Darwin":  # macOS
            subprocess.Popen(['sudo', 'shutdown', '-r', 'now'])
    
    def execute_sleep(self):
        """Put system to sleep"""
        system = platform.system()
        if system == "Windows":
            subprocess.Popen(['rundll32.exe', 'powrprof.dll,SetSuspendState', '0,1,0'])
        elif system == "Linux":
            subprocess.Popen(['systemctl', 'suspend'])
        elif system == "Darwin":  # macOS
            subprocess.Popen(['pmset', 'sleepnow'])
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def generate_token():
    """Generate a random device token"""
    import secrets
    return secrets.token_urlsafe(32)

def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def main():
    """Start the agent server"""
    global DEVICE_TOKEN
    
    # Generate token if not set
    if DEVICE_TOKEN == "DEVICE_TOKEN_PLACEHOLDER":
        DEVICE_TOKEN = generate_token()
        print(f"\n{'='*60}")
        print(f"🔑 DEVICE TOKEN (save this in your remote control app):")
        print(f"   {DEVICE_TOKEN}")
        print(f"{'='*60}\n")
    
    local_ip = get_local_ip()
    
    print(f"🚀 Remote Control Agent Started")
    print(f"📍 Listening on: http://{local_ip}:{PORT}")
    print(f"💻 Hostname: {socket.gethostname()}")
    print(f"🖥️  Platform: {platform.system()}")
    print(f"\nWaiting for commands from remote control...")
    print(f"Press Ctrl+C to stop\n")
    
    server = HTTPServer(('0.0.0.0', PORT), CommandHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Agent stopped")
        server.shutdown()

if __name__ == "__main__":
    main()
