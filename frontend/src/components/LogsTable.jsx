import { useState } from "react";

const dummyLogs = [
  { id: 1, ip: "192.168.1.10", status: "Blocked" },
  { id: 2, ip: "10.0.0.5", status: "Allowed" },
  { id: 3, ip: "172.16.0.2", status: "Blocked" },
];

export default function LogsTable() {
  const [search, setSearch] = useState("");

  const filtered = dummyLogs.filter((log) =>
    log.ip.includes(search)
  );

  return (
    <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-white mb-3">📜 Logs</h2>
      <input
        type="text"
        placeholder="Search IP..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
      />
      <table className="w-full text-white">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">IP Address</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log) => (
            <tr key={log.id} className="border-b border-gray-600">
              <td className="p-2">{log.ip}</td>
              <td className="p-2">{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
