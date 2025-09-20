import { useEffect, useState } from "react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  
  // Alert sound
  const playSound = () => {
    const audio = new Audio("/alert.mp3"); // public folder me alert.mp3 rakho
    audio.play();
  };

  useEffect(() => {
    // Fake alerts for demo
    const interval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        msg: `Attack detected at ${new Date().toLocaleTimeString()}`,
      };
      setAlerts((prev) => [newAlert, ...prev]);
      playSound(); // naya alert aate hi sound play hoga
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300 shadow-xl">
      <h2 className="text-xl font-bold mb-2">🚨 Live Alerts</h2>
      <ul className="space-y-1">
        {alerts.map((a) => (
          <li key={a.id} className="text-sm">{a.msg}</li>
        ))}
      </ul>
    </div>
  );
}
