    # 🛡️ PathGuard — Smart Security & Tracking System

**PathGuard** is an **IoT + Web + Security Monitoring** project that combines **GPS tracking, real-time map visualization, intrusion detection, and Arduino-based hardware integration** into one platform.  

This project leverages multiple technologies:
- **Node.js & Express** → Backend APIs and GPS tracker
- **React (Vite)** → Frontend dashboard for live maps, alerts, and logs
- **Arduino (ESP32, LoRa, GPS)** → Hardware-level sensing and communication
- **CyberWall module** → Attack detection & log analysis system

---

## ✨ Features
- 🚗 Real-time **GPS location tracking**
- 🗺️ Interactive **map visualization** (frontend)
- 🔒 **CyberWall security module** for detecting suspicious traffic/logs
- 📡 **Arduino hardware integration** (ESP32 + LoRa + GPS)
- 🔗 **Backend APIs** for communication between devices and dashboard
- 🧩 Modular folder structure (easy to maintain & extend)

---

## 📂 Project Structure
PathGuard/
├─ frontend/ → React (Vite) based UI dashboard
├─ backend/ → Node.js/Express REST API server
├─ gps-tracker/ → GPS tracking service (Node.js)
├─ arduino_sketches/ → Arduino (.ino) codes for ESP32 + LoRa + GPS
├─ .gitignore
└─ README.md



---

## ⚙️ Setup & Run Instructions

### 🔸 1. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev

🔸 2. Backend (Node/Express)
cd backend
npm install
npm start


🔸 3. GPS Tracker Service

cd gps-tracker
npm install
node server.js

🔸 4. Arduino Sketches
Open arduino_sketches/*.ino files in Arduino IDE
Select board & port → Upload

🛡️ CyberWall Module

The CyberWall module is designed to:
Collect logs and network traffic data
Detect anomalies or attack patterns
Provide alerts on the dashboard
Initial testing can be done using dummy traffic generators and manual JSON log submissions (via Postman).
