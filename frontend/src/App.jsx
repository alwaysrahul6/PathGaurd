import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { Activity, AlertTriangle, Shield, WifiOff, Lock, MapPin, Clock, AlertCircle } from "lucide-react";
import KPI from "./components/KPI";
import GlobeView from "./components/GlobeView";
import Charts from "./components/Charts";
import Alerts from "./components/Alerts";
import LogsTable from "./components/LogsTable";
import MitigatedTable from "./components/MitigatedTable";
import RadarSweep from "./components/RadarSweep";
import "./performance.css";

const API_BASE = "/api";
const POLL_MS = 3000; // Increased from 2000ms to reduce server load
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;


const fmtTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso ?? "";
  }
};

const classNames = (...c) => c.filter(Boolean).join(" ");

const statusColor = (s) =>
  s === "safe"
    ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
    : "text-red-400 border-red-500/40 bg-red-500/10 animate-pulse";

// Extract unique suspicious IPs from alerts
const extractSuspiciousIPs = (alerts) => {
  const ipMap = new Map();
  alerts.forEach(alert => {
    if (alert.ip) {
      const existing = ipMap.get(alert.ip) || { ip: alert.ip, count: 0, lastSeen: alert.time, reasons: [] };
      existing.count++;
      existing.lastSeen = alert.time;
      if (alert.reason && !existing.reasons.includes(alert.reason)) {
        existing.reasons.push(alert.reason);
      }
      ipMap.set(alert.ip, existing);
    }
  });
  return Array.from(ipMap.values()).sort((a, b) => b.count - a.count);
};

const randomPoint = () => ({
  lat: (Math.random() - 0.5) * 140,
  lng: (Math.random() - 0.5) * 340,
});


// Memoized SuspiciousIPs component for better performance
const SuspiciousIPs = memo(({ data, fmtTime }) => (
  <div className="lg:col-span-2 rounded-2xl border-2 border-red-500/30 bg-black/40 shadow-2xl shadow-red-500/10 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/30 hover:border-red-400/60 hover:scale-[1.02] transform-gpu relative">
    {/* Cyber Container Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>
    {/* Cyber Corner Accents */}
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400/60"></div>
    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-400/60"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-400/60"></div>
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400/60"></div>
    
    <div className="relative z-10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Suspicious IPs</h3>
          <p className="text-sm text-red-300/80">Attacker Details</p>
        </div>
        <div className="ml-auto px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
          <span className="text-red-400 font-mono text-sm">{data.length}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-emerald-300 font-mono">No Suspicious Activity</p>
            <p className="text-emerald-300/60 text-sm">All systems secure</p>
          </div>
        ) : (
          data.map((ipData, index) => (
            <div
              key={ipData.ip}
              className="group p-4 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all duration-300 hover:border-red-400/40 hover:scale-[1.02] transform-gpu"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span className="font-mono text-red-300 font-bold">{ipData.ip}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 font-mono text-xs">{ipData.count}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-red-300/80">
                  <Clock className="w-3 h-3" />
                  <span>Last seen: {fmtTime(ipData.lastSeen)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {ipData.reasons.map((reason, reasonIndex) => (
                    <span
                      key={reasonIndex}
                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 font-mono"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Threat Level Indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-red-500/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      ipData.count > 10 ? 'bg-red-500' : 
                      ipData.count > 5 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((ipData.count / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-red-300/60 font-mono">
                  {ipData.count > 10 ? 'HIGH' : ipData.count > 5 ? 'MED' : 'LOW'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
));

function App() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mitigated, setMitigated] = useState([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState([]);
  const [online, setOnline] = useState(true);
  const globeRef = useRef(null);

  // Optimized data fetching with retry logic and caching
  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const [lRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/logs/`, { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE}/alerts/`, { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        }),
      ]);
      
      clearTimeout(timeoutId);
      
      if (!lRes.ok || !aRes.ok) {
        throw new Error(`HTTP ${lRes.status || aRes.status}`);
      }
      
      const [l, a] = await Promise.all([lRes.json(), aRes.json()]);
      
      setLogs(Array.isArray(l) ? l : []);
      setAlerts(Array.isArray(a) ? a : []);
      setSuspiciousIPs(extractSuspiciousIPs(Array.isArray(a) ? a : []));
      setOnline(true);
      
    } catch (error) {
      console.warn('API fetch failed:', error.message);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => fetchData(retryCount + 1), RETRY_DELAY * (retryCount + 1));
      } else {
        setOnline(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const fetchAll = () => {
      if (mounted) fetchData();
    };
    
    // Initial fetch
    fetchAll();
    
    // Set up polling
    const id = setInterval(fetchAll, POLL_MS);
    
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchData]);

  const kpis = useMemo(() => {
    const total = logs.length;
    const attacks = alerts.length;
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    const last5m = logs.filter((x) => {
      const t = new Date(x.timestamp || now);
      return t.getTime() > fiveMinutesAgo;
    }).length;
    
    const byType = alerts.reduce((acc, a) => {
      const key = (a.reason || "attack").split(" ")[0];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    return { total, attacks, last5m, byType };
  }, [logs, alerts]);

  const chartData = useMemo(() => {
    if (logs.length === 0) return [];
    
    const buckets = new Map();
    const now = Date.now();
    
    logs.forEach((x) => {
      const t = x.timestamp ? new Date(x.timestamp) : new Date(now);
      const key = Math.floor(t.getTime() / 60000) * 60000;
      const k = new Date(key).toISOString();
      
      if (!buckets.has(k)) {
        buckets.set(k, { time: k, logs: 0, attacks: 0 });
      }
      
      const row = buckets.get(k);
      row.logs += 1;
      if ((x.status || "").toLowerCase() !== "safe") {
        row.attacks += 1;
      }
    });
    
    return Array.from(buckets.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  const globeArcs = useMemo(() => {
    if (alerts.length === 0) return [];
    
    const INDIA = { lat: 21.146633, lng: 79.08886 };
    
    // Create more realistic attack locations
    const attackLocations = [
      { lat: 40.7128, lng: -74.0060, name: "New York" },
      { lat: 51.5074, lng: -0.1278, name: "London" },
      { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
      { lat: 55.7558, lng: 37.6176, name: "Moscow" },
      { lat: 39.9042, lng: 116.4074, name: "Beijing" },
      { lat: -33.8688, lng: 151.2093, name: "Sydney" },
      { lat: 52.5200, lng: 13.4050, name: "Berlin" },
      { lat: 48.8566, lng: 2.3522, name: "Paris" },
      { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
      { lat: 1.3521, lng: 103.8198, name: "Singapore" }
    ];
    
    return alerts.slice(-15).map((alert, index) => {
      const startLocation = attackLocations[index % attackLocations.length];
      return {
        startLat: startLocation.lat,
        startLng: startLocation.lng,
        endLat: INDIA.lat,
        endLng: INDIA.lng,
        color: alert.reason?.includes("Attack") ? ["#ef4444", "#dc2626"] : ["#22c55e", "#16a34a"],
        stroke: 2,
        label: startLocation.name
      };
    });
  }, [alerts]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    
    // Set initial view
    g.pointOfView({ lat: 20, lng: 0, altitude: 1.8 });
    
    // Configure controls
    const controls = g.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.minDistance = 200;
      controls.maxDistance = 500;
    }
  }, []);

  const handleMitigate = useCallback((alert) => {
    setMitigated((prev) => [...prev, alert]);
    setAlerts((prev) => prev.filter((a) => a !== alert));
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      {/* Cyber Background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-black via-slate-900 via-emerald-900/20 to-black" />
      <div className="absolute inset-0 -z-15 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      {/* Cyber Scan Lines */}
      <div className="absolute inset-0 -z-5">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse animation-delay-2000"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse animation-delay-3000"></div>
      </div>
      
      {/* Cyber Particles */}
      <div className="absolute inset-0 -z-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60 shadow-lg shadow-emerald-400/50"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-emerald-300 rounded-full animate-ping opacity-40 shadow-lg shadow-emerald-300/50"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce opacity-50 shadow-lg shadow-emerald-500/50"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-pulse opacity-70 shadow-lg shadow-emerald-400/50"></div>
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60 shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50 shadow-lg shadow-blue-400/50"></div>
      </div>
      
      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent animate-matrix-rain"></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-matrix-rain animation-delay-1000"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-emerald-300/25 to-transparent animate-matrix-rain animation-delay-2000"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-matrix-rain animation-delay-3000"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent animate-matrix-rain animation-delay-4000"></div>
      </div>
      
      {/* Matrix Geometric Patterns */}
      <div className="absolute inset-0 -z-5 opacity-15">
        {/* Rotating Squares with Matrix Effects */}
        <div className="absolute top-10 left-10 w-16 h-16 border border-emerald-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse"></div>
        <div className="absolute top-20 right-20 w-12 h-12 border border-cyan-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-14 h-14 border border-blue-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse animation-delay-4000"></div>
        <div className="absolute bottom-10 right-10 w-10 h-10 border border-emerald-300/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 border border-cyan-300/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse animation-delay-3000"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 border border-emerald-500/30 transform rotate-45 animate-matrix-rotate animate-matrix-pulse animation-delay-2000"></div>
        
        {/* Matrix Hexagons with Float Effect */}
        <div className="absolute top-16 left-1/3 w-20 h-20 border border-emerald-400/25 transform rotate-12 animate-matrix-float animation-delay-1000" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-cyan-400/25 transform rotate-12 animate-matrix-float animation-delay-3000" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
        <div className="absolute bottom-1/4 left-1/6 w-12 h-12 border border-blue-400/25 transform rotate-12 animate-matrix-float animation-delay-2000" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
        
        {/* Matrix Triangles with Glow */}
        <div className="absolute top-24 left-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-emerald-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-glow animation-delay-4000"></div>
        <div className="absolute bottom-24 right-1/3 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-cyan-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-glow animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/6 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-blue-400/30 transform rotate-45 animate-matrix-rotate animate-matrix-glow animation-delay-3000"></div>
        
        {/* Matrix Circles with Flicker */}
        <div className="absolute top-32 left-1/4 w-8 h-8 border-2 border-emerald-400/20 rounded-full animate-matrix-rotate animate-matrix-flicker"></div>
        <div className="absolute bottom-32 right-1/4 w-6 h-6 border-2 border-cyan-400/20 rounded-full animate-matrix-rotate animate-matrix-flicker animation-delay-2000"></div>
        <div className="absolute top-2/3 left-2/3 w-4 h-4 border-2 border-blue-400/20 rounded-full animate-matrix-rotate animate-matrix-flicker animation-delay-4000"></div>
        
        {/* Additional Matrix Elements */}
        <div className="absolute top-40 left-1/5 w-10 h-10 border border-emerald-400/20 transform rotate-30 animate-matrix-float animate-matrix-pulse animation-delay-1000"></div>
        <div className="absolute bottom-40 right-1/5 w-8 h-8 border border-cyan-400/20 transform rotate-60 animate-matrix-float animate-matrix-pulse animation-delay-3000"></div>
        <div className="absolute top-1/2 right-1/2 w-6 h-6 border border-blue-400/20 transform rotate-90 animate-matrix-float animate-matrix-pulse animation-delay-2000"></div>
      </div>
      
      {/* Data Stream Effects */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        <div className="absolute top-0 left-1/6 w-px h-20 bg-gradient-to-b from-emerald-400/60 to-transparent animate-data-stream"></div>
        <div className="absolute top-0 left-1/3 w-px h-16 bg-gradient-to-b from-cyan-400/50 to-transparent animate-data-stream animation-delay-1000"></div>
        <div className="absolute top-0 left-2/3 w-px h-24 bg-gradient-to-b from-blue-400/40 to-transparent animate-data-stream animation-delay-2000"></div>
        <div className="absolute top-0 right-1/4 w-px h-18 bg-gradient-to-b from-emerald-300/50 to-transparent animate-data-stream animation-delay-3000"></div>
      </div>
      
      {/* Cyber Circuit Lines */}
      <div className="absolute inset-0 -z-5 opacity-20">
        <div className="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-40 h-px bg-gradient-to-l from-transparent via-cyan-400/30 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent"></div>
        <div className="absolute top-3/4 right-0 w-36 h-px bg-gradient-to-l from-transparent via-emerald-300/40 to-transparent"></div>
      </div>
      
      {/* Cyber Globe Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Digital Earth Globe */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 animate-globe-pulse">
          {/* Globe Base */}
          <div className="w-full h-full rounded-full border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-cyan-400/10 relative overflow-hidden animate-globe-rotate">
            {/* Continent Patterns */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
              {/* Digital Dots Pattern */}
              <div className="absolute inset-0 opacity-60">
                <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-2000"></div>
                <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-3000"></div>
                <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-4000"></div>
                <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-1000"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-3000"></div>
                <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-4000"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse animation-delay-1000"></div>
              </div>
            </div>
            
            {/* Network Lines */}
            <div className="absolute inset-0">
              {/* Horizontal Lines */}
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
              
              {/* Vertical Lines */}
              <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
              <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent"></div>
              <div className="absolute left-3/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
              
              {/* Diagonal Lines */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform rotate-45 origin-left"></div>
                <div className="absolute top-3/4 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -rotate-45 origin-left"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Network Connection Lines */}
        <div className="absolute inset-0 opacity-30">
          {/* Main Network Lines */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transform rotate-12 animate-network-glow"></div>
          <div className="absolute top-1/3 right-1/4 w-1/2 h-px bg-gradient-to-l from-transparent via-cyan-400/40 to-transparent transform -rotate-12 animate-network-glow animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent transform rotate-45 animate-network-glow animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-400/35 to-transparent transform -rotate-45 animate-network-glow animation-delay-3000"></div>
          
          {/* Connection Nodes */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse animate-network-glow"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-1000 animate-network-glow"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-2000 animate-network-glow"></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-3000 animate-network-glow"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-4000 animate-network-glow"></div>
        </div>
        
        {/* Data Streams */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-20 bg-gradient-to-b from-cyan-400/60 to-transparent animate-data-stream"></div>
          <div className="absolute top-0 left-1/2 w-px h-16 bg-gradient-to-b from-cyan-400/50 to-transparent animate-data-stream animation-delay-1000"></div>
          <div className="absolute top-0 right-1/4 w-px h-24 bg-gradient-to-b from-cyan-400/40 to-transparent animate-data-stream animation-delay-2000"></div>
          <div className="absolute top-0 right-1/3 w-px h-18 bg-gradient-to-b from-cyan-400/50 to-transparent animate-data-stream animation-delay-3000"></div>
        </div>
      </div>
      
      {/* Cyber Text Overlay */}
      <div className="absolute inset-0 -z-5 opacity-5 font-mono text-xs text-emerald-400 overflow-hidden">
        <div className="absolute top-20 left-10 animate-cyber-flicker">CYBERWALL v2.0</div>
        <div className="absolute top-32 left-20 animate-cyber-flicker animation-delay-1000">SECURE</div>
        <div className="absolute top-44 left-16 animate-cyber-flicker animation-delay-2000">PROTECTED</div>
        <div className="absolute bottom-32 right-10 animate-cyber-flicker animation-delay-3000">MONITORING</div>
        <div className="absolute bottom-20 right-20 animate-cyber-flicker animation-delay-4000">ACTIVE</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-cyber-flicker animation-delay-1000">IDS ONLINE</div>
      </div>

      {/* Cyber Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-black/40 border-b border-emerald-500/30 transition-all duration-300 hover:bg-black/50 relative">
        {/* Cyber Header Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5"></div>
        
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="h-6 w-6 text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" />
              <div className="absolute inset-0 h-6 w-6 text-emerald-400 opacity-30 animate-ping">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <div className="relative">
              <h1 className="text-xl font-semibold tracking-wide bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-200 bg-clip-text text-transparent">
                CyberWall • Live IDS Dashboard
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-50"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Cyber Status Indicator */}
          <div
            className={classNames(
                "text-sm px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 relative overflow-hidden",
                online ? "border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10" : "border-red-500/60 text-red-300 hover:bg-red-500/10"
              )}
            >
              {/* Cyber Glow Effect */}
              <div className={classNames(
                "absolute inset-0 opacity-20",
                online ? "bg-emerald-500" : "bg-red-500"
              )}></div>
              
              <span className="flex items-center gap-2 relative z-10">
                <div className={classNames(
                  "w-2 h-2 rounded-full animate-pulse shadow-lg",
                  online ? "bg-emerald-400 shadow-emerald-400/50" : "bg-red-400 shadow-red-400/50"
                )}></div>
                <span className="font-mono text-xs tracking-wider">
                  {online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Globe + KPIs */}
      <section className="mx-auto max-w-7xl px-4 pt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3 rounded-2xl border-2 border-emerald-500/30 bg-black/40 shadow-2xl shadow-emerald-500/10 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/60 hover:scale-[1.02] transform-gpu relative">
          {/* Cyber Container Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"></div>
          {/* Cyber Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400/60"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400/60"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400/60"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400/60"></div>
          
          <div className="relative z-10">
          <GlobeView globeArcs={globeArcs} globeRef={globeRef} />
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <KPI icon={Activity} label="Total Logs" value={kpis.total} />
          <KPI icon={AlertTriangle} label="Detected Attacks" value={kpis.attacks} danger />
          <KPI icon={Shield} label="Logs (5 min)" value={kpis.last5m} />
          <KPI icon={WifiOff} label="Types Tracked" value={Object.keys(kpis.byType).length} />
          <KPI icon={Lock} label="Mitigated" value={mitigated.length} />
        </div>
      </section>

      {/* Charts + Alerts + Suspicious IPs */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-6 gap-6">
        <Charts chartData={chartData} />
        <Alerts alerts={alerts} handleMitigate={handleMitigate} fmtTime={fmtTime} />
        <SuspiciousIPs data={suspiciousIPs} fmtTime={fmtTime} />
      </main>

      {/* Mitigated */}
      {mitigated.length > 0 && <MitigatedTable mitigated={mitigated} fmtTime={fmtTime} />}

      {/* Logs */}
      <LogsTable logs={logs} fmtTime={fmtTime} statusColor={statusColor} POLL_MS={POLL_MS} />

      <footer className="mx-auto max-w-7xl px-4 pb-6 text-xs text-slate-500 relative">
        <div className="flex items-center justify-center gap-4 py-4 border-t border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-lg shadow-emerald-400/50"></div>
            <span className="font-mono tracking-wider animate-cyber-glow">SYSTEM STATUS</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-lg shadow-emerald-400/50 animation-delay-1000"></div>
          </div>
          <div className="w-px h-4 bg-emerald-500/30"></div>
          <span className="font-mono">Built for demo • Add JWT & rate-limiting for prod</span>
          <div className="w-px h-4 bg-emerald-500/30"></div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse animation-delay-1000"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default memo(App);
