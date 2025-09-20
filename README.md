    # 🛡️ PathGuard — Smart Security & Tracking System

**PathGuard** is an **IoT + Web + Security Monitoring** project that combines **GPS tracking, real-time map visualization, intrusion detection, and Arduino-based hardware integration** into one platform.  

PathGuard is an innovative GPS-based tracking system designed for defense and military operations.
The primary goal of this project is to track the real-time location of soldiers on the battlefield, ensuring better coordination, safety, and rapid response in critical missions.

This system bridges the gap between field soldiers and command centers by providing accurate, real-time location data that can save lives during high-risk operations.

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

A Project Dedicated to Soldiers

“Not all heroes wear capes, some wear uniforms. PathGuard ensures they return home safe.”
