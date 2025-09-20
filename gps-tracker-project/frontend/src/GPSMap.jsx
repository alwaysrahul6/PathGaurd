import { useEffect, useState } from "react";
import io from "socket.io-client";
import L from "leaflet";

export default function GPSMap() {
  const [socketStatus, setSocketStatus] = useState("connecting...");
  const [devices, setDevices] = useState({});
  const [map, setMap] = useState(null);

  useEffect(() => {
    const m = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(m);
    setMap(m);
  }, []);

  useEffect(() => {
    if (!map) return;

    const SERVER = import.meta?.env?.VITE_SERVER_URL || "http://localhost:3000";
    const socket = io(SERVER);

    socket.on("connect", () => setSocketStatus("connected"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));

    socket.on("location-update", (d) => {
      setDevices((prev) => {
        const updated = { ...prev };
        if (!updated[d.deviceId]) {
          const marker = L.marker([d.lat, d.lon], {
            title: d.deviceId,
            icon: L.divIcon({
              className:
                "w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg",
            }),
          }).addTo(map);
          const poly = L.polyline([[d.lat, d.lon]], { weight: 4 }).addTo(map);
          updated[d.deviceId] = { marker, poly, last: d };
          map.setView([d.lat, d.lon], 15);
        } else {
          updated[d.deviceId].marker.setLatLng([d.lat, d.lon]);
          updated[d.deviceId].poly.addLatLng([d.lat, d.lon]);
          updated[d.deviceId].last = d;
        }
        return updated;
      });
    });

    return () => socket.disconnect();
  }, [map]);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Live GPS Tracker</h1>
        <span>
          Status: <span className="font-semibold">{socketStatus}</span>
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Devices</h2>
          <ul className="space-y-2">
            {Object.entries(devices).map(([id, data]) => (
              <li
                key={id}
                className="p-2 bg-white rounded shadow cursor-pointer hover:bg-blue-50"
                onClick={() =>
                  map && map.setView([data.last.lat, data.last.lon], 16)
                }
              >
                <div className="font-bold">{id}</div>
                <div className="text-sm text-gray-600">
                  Lat: {data.last.lat.toFixed(5)}, Lon:{" "}
                  {data.last.lon.toFixed(5)}
                </div>
                <div className="text-xs text-gray-500">
                  Speed: {data.last.speedKmph || "N/A"} km/h
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div id="map" className="flex-1" />
      </div>
    </div>
  );
}
