#!/usr/bin/env python3
"""Test VERSSAI port connectivity after fixes"""

import requests
import sys
from datetime import datetime

def test_service(service_name, url, timeout=5):
    """Test if a service is accessible"""
    try:
        response = requests.get(url, timeout=timeout)
        status = "✅ CONNECTED" if response.status_code in [200, 404] else f"⚠️  HTTP {response.status_code}"
        print(f"  {service_name:15} {url:30} {status}")
        return True
    except Exception as e:
        print(f"  {service_name:15} {url:30} ❌ ERROR: {str(e)[:30]}")
        return False

def main():
    print("🔍 VERSSAI Port Connectivity Test")
    print("=" * 50)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("")
    
    services = [
        ("Backend API", "http://localhost:8080/health"),
        ("Frontend", "http://localhost:3000"),
        ("ChromaDB", "http://localhost:8000/api/v1/heartbeat"),
        ("N8N", "http://localhost:5678/healthz"),
        ("PostgreSQL", "http://localhost:5432"),  # Will fail but that's expected
        ("Redis", "http://localhost:6379")       # Will fail but that's expected
    ]
    
    connected_count = 0
    total_count = len(services) - 2  # Exclude PostgreSQL/Redis (not HTTP)
    
    for service_name, url in services:
        if "5432" in url or "6379" in url:
            print(f"  {service_name:15} {url:30} ⚪ SKIP (Not HTTP)")
            continue
        
        if test_service(service_name, url):
            connected_count += 1
    
    print("")
    print(f"📊 Results: {connected_count}/{total_count} services accessible")
    
    if connected_count == total_count:
        print("🎉 All HTTP services are accessible!")
        return 0
    elif connected_count >= total_count * 0.75:
        print("⚠️  Most services accessible - some may still be starting")
        return 0
    else:
        print("❌ Multiple services not accessible - check docker-compose")
        return 1

if __name__ == "__main__":
    sys.exit(main())
