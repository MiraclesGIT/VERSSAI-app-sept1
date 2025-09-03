#!/usr/bin/env python3
"""
Simple VERSSAI Test Backend
Minimal backend for health check and assessment
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, Any

# Try to import FastAPI, fallback to basic HTTP server
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    USE_FASTAPI = True
except ImportError:
    USE_FASTAPI = False
    import http.server
    import socketserver
    from urllib.parse import urlparse, parse_qs

# Try to test ChromaDB connection
def test_chromadb():
    try:
        import requests
        response = requests.get("http://localhost:8000/api/v1/heartbeat", timeout=2)
        return response.status_code in [200, 410]  # 410 is expected for deprecated v1 API
    except:
        return False

def test_postgres():
    try:
        import subprocess
        result = subprocess.run(
            ["docker", "exec", "verssai_postgres", "pg_isready", "-U", "verssai_user"],
            capture_output=True, timeout=5
        )
        return result.returncode == 0
    except:
        return False

def test_redis():
    try:
        import subprocess
        result = subprocess.run(
            ["docker", "exec", "verssai_redis", "redis-cli", "ping"],
            capture_output=True, timeout=5
        )
        return b"PONG" in result.stdout
    except:
        return False

def get_system_status():
    """Get comprehensive system status"""
    return {
        "timestamp": datetime.now().isoformat(),
        "status": "healthy",
        "version": "1.0.0-test",
        "services": {
            "chromadb": test_chromadb(),
            "postgres": test_postgres(), 
            "redis": test_redis(),
        },
        "uptime": time.time() - start_time,
        "environment": {
            "python_version": os.sys.version,
            "working_directory": os.getcwd(),
        }
    }

start_time = time.time()

if USE_FASTAPI:
    # FastAPI implementation
    app = FastAPI(
        title="VERSSAI Test Backend",
        description="Simple backend for health check and testing",
        version="1.0.0-test"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"message": "VERSSAI Test Backend is running", "status": "healthy"}
    
    @app.get("/health")
    async def health():
        return get_system_status()
        
    @app.get("/api/status")
    async def api_status():
        return get_system_status()
    
    @app.get("/api/rag/status")
    async def rag_status():
        return {
            "chromadb": test_chromadb(),
            "message": "RAG engine status",
            "timestamp": datetime.now().isoformat()
        }
    
    @app.get("/api/mcp/status")
    async def mcp_status():
        return {
            "status": "test_mode",
            "websocket_available": False,
            "message": "MCP protocol in test mode"
        }
    
    if __name__ == "__main__":
        print("🚀 Starting VERSSAI Test Backend on port 8080")
        print("   Health check: http://localhost:8080/health")
        print("   Status API: http://localhost:8080/api/status")
        uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")

else:
    # Fallback HTTP server implementation
    class TestHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            parsed = urlparse(self.path)
            
            if parsed.path in ["/", "/health", "/api/status"]:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = get_system_status()
                self.wfile.write(json.dumps(response).encode())
            
            elif parsed.path == "/api/rag/status":
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "chromadb": test_chromadb(),
                    "message": "RAG engine status",
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
            
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'{"error": "Not found"}')
    
    if __name__ == "__main__":
        print("🚀 Starting VERSSAI Test Backend on port 8080 (basic HTTP)")
        print("   Health check: http://localhost:8080/health")
        with socketserver.TCPServer(("", 8080), TestHandler) as httpd:
            httpd.serve_forever()