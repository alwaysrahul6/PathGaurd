# #!/usr/bin/env python3
# """
# Demo Attack Generator for CyberWall Dashboard
# Simulates various types of cyber attacks for testing
# """

# import requests
# import time
# import random
# import json
# # from datetime import datetime
# from datetime import datetime, timezone

# # Configuration
# BACKEND_URL = "http://localhost:5000/api/logs/"
# ATTACK_INTERVAL = 2  # seconds between attacks

# # Attack patterns
# ATTACK_PATTERNS = [
#     {
#         "name": "SQL Injection",
#         "ip": "192.168.1.100",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/admin/login",
#         "method": "POST",
#         "response_code": 200,
#         "payload": "admin' OR '1'='1' --",
#         "attack_type": "SQL Injection"
#     },
#     {
#         "name": "XSS Attack",
#         "ip": "192.168.1.101",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/search",
#         "method": "GET",
#         "response_code": 200,
#         "payload": "<script>alert('XSS')</script>",
#         "attack_type": "XSS"
#     },
#     {
#         "name": "Brute Force",
#         "ip": "192.168.1.102",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/login",
#         "method": "POST",
#         "response_code": 401,
#         "payload": "password123",
#         "attack_type": "Brute Force"
#     },
#     {
#         "name": "DDoS Attack",
#         "ip": "192.168.1.103",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/api/data",
#         "method": "GET",
#         "response_code": 200,
#         "payload": "",
#         "attack_type": "DDoS"
#     },
#     {
#         "name": "Directory Traversal",
#         "ip": "192.168.1.104",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/../../../etc/passwd",
#         "method": "GET",
#         "response_code": 403,
#         "payload": "",
#         "attack_type": "Directory Traversal"
#     },
#     {
#         "name": "Command Injection",
#         "ip": "192.168.1.105",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/api/execute",
#         "method": "POST",
#         "response_code": 200,
#         "payload": "; rm -rf /",
#         "attack_type": "Command Injection"
#     }
# ]

# # Normal traffic patterns
# NORMAL_PATTERNS = [
#     {
#         "ip": "192.168.1.200",
#         "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
#         "request_path": "/",
#         "method": "GET",
#         "response_code": 200,
#         "payload": ""
#     },
#     {
#         "ip": "192.168.1.201",
#         "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
#         "request_path": "/about",
#         "method": "GET",
#         "response_code": 200,
#         "payload": ""
#     },
#     {
#         "ip": "192.168.1.202",
#         "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
#         "request_path": "/contact",
#         "method": "GET",
#         "response_code": 200,
#         "payload": ""
#     }
# ]

# def send_log(log_data):
#     """Send log data to backend"""
#     try:
#         response = requests.post(BACKEND_URL, json=log_data, timeout=5)
#         if response.status_code == 201:
#             result = response.json()
#             print(f"✅ {log_data.get('attack_type', 'Normal')} - {log_data.get('ip')} - {result.get('result', 'Unknown')}")
#         else:
#             print(f"❌ Failed to send log: {response.status_code}")
#     except requests.exceptions.RequestException as e:
#         print(f"❌ Connection error: {e}")

# def generate_attack():
#     """Generate a random attack"""
#     attack = random.choice(ATTACK_PATTERNS).copy()
#     attack["timestamp"] = datetime.utcnow().isoformat()
#     return attack

# def generate_normal():
#     """Generate normal traffic"""
#     normal = random.choice(NORMAL_PATTERNS).copy()
#     normal["timestamp"] = datetime.utcnow().isoformat()
#     return normal

# def main():
#     """Main attack simulation loop"""
#     print("🚨 CyberWall Demo Attack Generator Started!")
#     print("=" * 50)
#     print("Press Ctrl+C to stop")
#     print("=" * 50)
    
#     attack_count = 0
#     normal_count = 0
    
#     try:
#         while True:
#             # 70% chance of attack, 30% normal traffic
#             if random.random() < 0.7:
#                 log_data = generate_attack()
#                 attack_count += 1
#             else:
#                 log_data = generate_normal()
#                 normal_count += 1
            
#             send_log(log_data)
            
#             # Show stats every 10 requests
#             total = attack_count + normal_count
#             if total % 10 == 0:
#                 print(f"\n📊 Stats: {attack_count} attacks, {normal_count} normal, {total} total\n")
            
#             time.sleep(ATTACK_INTERVAL)
            
#     except KeyboardInterrupt:
#         print(f"\n\n🛑 Attack simulation stopped!")
#         print(f"📊 Final Stats: {attack_count} attacks, {normal_count} normal, {attack_count + normal_count} total")
#         print("👋 Goodbye!")

# if __name__ == "__main__":
#     main()


#!/usr/bin/env python3
"""
Demo Attack Generator for CyberWall Dashboard
Simulates various types of cyber attacks for testing
"""

import requests
import time
import random
import json
from datetime import datetime, timezone

# Configuration
BACKEND_URL = "http://localhost:8000/api/logs/"  # matches app.register_blueprint(..., url_prefix="/api/logs")
ATTACK_INTERVAL = 2  # seconds between attacks
REQUEST_TIMEOUT = 10   # seconds

# Attack patterns
ATTACK_PATTERNS = [
    {
        "name": "SQL Injection",
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/admin/login",
        "method": "POST",
        "response_code": 200,
        "payload": "admin' OR '1'='1' --",
        "attack_type": "SQL Injection"
    },
    {
        "name": "XSS Attack",
        "ip": "192.168.1.101",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/search",
        "method": "GET",
        "response_code": 200,
        "payload": "<script>alert('XSS')</script>",
        "attack_type": "XSS"
    },
    {
        "name": "Brute Force",
        "ip": "192.168.1.102",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/login",
        "method": "POST",
        "response_code": 401,
        "payload": "password123",
        "attack_type": "Brute Force"
    },
    {
        "name": "DDoS Attack",
        "ip": "192.168.1.103",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/api/data",
        "method": "GET",
        "response_code": 200,
        "payload": "",
        "attack_type": "DDoS"
    },
    {
        "name": "Directory Traversal",
        "ip": "192.168.1.104",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/../../../etc/passwd",
        "method": "GET",
        "response_code": 403,
        "payload": "",
        "attack_type": "Directory Traversal"
    },
    {
        "name": "Command Injection",
        "ip": "192.168.1.105",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/api/execute",
        "method": "POST",
        "response_code": 200,
        "payload": "; rm -rf /",
        "attack_type": "Command Injection"
    }
]

# Normal traffic patterns
NORMAL_PATTERNS = [
    {
        "ip": "192.168.1.200",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "request_path": "/",
        "method": "GET",
        "response_code": 200,
        "payload": ""
    },
    {
        "ip": "192.168.1.201",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "request_path": "/about",
        "method": "GET",
        "response_code": 200,
        "payload": ""
    },
    {
        "ip": "192.168.1.202",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "request_path": "/contact",
        "method": "GET",
        "response_code": 200,
        "payload": ""
    }
]

def send_log(log_data):
    """Send log data to backend with better debugging info"""
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(BACKEND_URL, json=log_data, headers=headers, timeout=REQUEST_TIMEOUT)
        # Accept 201 Created or 200 OK (some APIs return 200)
        if response.status_code in (200, 201):
            try:
                result = response.json()
                print(f"✅ {log_data.get('attack_type', 'Normal')} - {log_data.get('ip')} - {result.get('result', 'OK')}")
            except ValueError:
                print(f"✅ {log_data.get('attack_type', 'Normal')} - {log_data.get('ip')} - {response.status_code}")
        elif response.status_code == 404:
            # More helpful message for 404
            print(f"❌ 404 Not Found. Check BACKEND_URL and route. Sent to: {BACKEND_URL}")
            print(f"   Server response body: {response.text}")
        else:
            print(f"❌ Failed to send log: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")

def now_iso():
    """Return timezone-aware ISO timestamp (UTC)"""
    return datetime.now(timezone.utc).isoformat()

def generate_attack():
    attack = random.choice(ATTACK_PATTERNS).copy()
    attack["timestamp"] = now_iso()
    return attack

def generate_normal():
    normal = random.choice(NORMAL_PATTERNS).copy()
    normal["timestamp"] = now_iso()
    return normal

def main():
    """Main attack simulation loop"""
    print("🚨 CyberWall Demo Attack Generator Started!")
    print("=" * 50)
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    attack_count = 0
    normal_count = 0
    
    try:
        while True:
            # 70% chance of attack, 30% normal traffic
            if random.random() < 0.7:
                log_data = generate_attack()
                attack_count += 1
            else:
                log_data = generate_normal()
                normal_count += 1
            
            # Show compact preview
            print(f"→ Sending: {log_data.get('attack_type', 'Normal')} | {log_data.get('ip')} | {log_data.get('timestamp')}")
            send_log(log_data)
            
            # Show stats every 10 requests
            total = attack_count + normal_count
            if total % 10 == 0:
                print(f"\n📊 Stats: {attack_count} attacks, {normal_count} normal, {total} total\n")
            
            time.sleep(ATTACK_INTERVAL)
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Attack simulation stopped!")
        print(f"📊 Final Stats: {attack_count} attacks, {normal_count} normal, {attack_count + normal_count} total")
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()
