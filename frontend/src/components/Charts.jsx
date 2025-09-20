import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Charts({ chartData }) {
  return (
    <div className="lg:col-span-3 rounded-2xl border border-emerald-500/20 bg-black/30 shadow-xl p-4">
      <h2 className="text-sm tracking-widest text-emerald-400 uppercase mb-2">Traffic Overview</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#16a34a33" />
            <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid #16a34a55" }} labelFormatter={(t) => new Date(t).toLocaleString()} />
            <Legend />
            <Area type="monotone" dataKey="logs" stroke="#22c55e" fill="url(#g1)" name="Logs" />
            <Area type="monotone" dataKey="attacks" stroke="#ef4444" fill="url(#g2)" name="Attacks" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
