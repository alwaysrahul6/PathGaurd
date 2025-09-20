
import requests
import random
import threading
import time

# Flask backend endpoint
url = "http://127.0.0.1:8000/api/logs/"

def generate_dummy_log():
    ip = f"192.168.{random.randint(0,255)}.{random.randint(1,254)}"
    req_count = random.randint(1, 500)
    user_agents = ["Chrome", "Firefox", "Edge", "Safari"]
    ua = random.choice(user_agents)
    return {
        "ip": ip,
        "req_count": req_count,
        "user_agent": ua
    }

def send_log_thread(thread_id, interval=0.1):
    while True:
        log = generate_dummy_log()
        try:
            response = requests.post(url, json=log)
            if response.status_code == 200:
                print(f"[Thread-{thread_id}] Sent: {log}")
            else:
                print(f"[Thread-{thread_id}] Failed: {response.status_code}")
        except Exception as e:
            print(f"[Thread-{thread_id}] Error: {e}")
        time.sleep(interval)

def start_traffic(num_threads=10, interval=0.1):
    threads = []
    for i in range(num_threads):
        t = threading.Thread(target=send_log_thread, args=(i+1, interval))
        t.daemon = True  # background threads stop when main thread stops
        t.start()
        threads.append(t)
    print(f"Started {num_threads} threads sending logs every {interval}s each.")
    try:
        while True:
            time.sleep(1)  # Keep main thread alive
    except KeyboardInterrupt:
        print("\nStopped traffic generator.")

if __name__ == "__main__":
    start_traffic(num_threads=10, interval=0.1)  # 10 threads, each sending log every 0.1s
