# services/detection.py

def detect_attack(data):
    """
    Rule-based attack detection system
    Input: log data (dict)
    Output: "safe" or type of attack (str)
    """

    ip = data.get("ip", "unknown")
    req_count = data.get("req_count", 0)
    failed_logins = data.get("failed_logins", 0)
    port = data.get("port", 80)
    payload = data.get("payload", "")
    time_window = data.get("time_window", 60)  # in seconds (default 1 min)

    # 1. DDoS detection (too many requests in short time)
    if req_count > 1000:
        return f"Possible DDoS attack from {ip}"

    # 2. Brute force detection (too many failed logins)
    if failed_logins > 5:
        return f"Brute force attack suspected from {ip}"

    # 3. Port scan detection (accessing unusual ports)
    suspicious_ports = [21, 23, 3389]  # FTP, Telnet, RDP
    if port in suspicious_ports:
        return f"Suspicious port scan on port {port} from {ip}"

    # 4. Injection detection (SQLi, XSS patterns)
    attack_patterns = ["<script>", "drop table", "' or 1=1", "--", "union select"]
    if any(x in payload.lower() for x in attack_patterns):
        return f"Injection attack suspected in payload from {ip}"

    # 5. Abnormal request rate (optional)
    if req_count > 100 and time_window < 60:
        return f"Abnormal request rate from {ip}"

    return "safe"
