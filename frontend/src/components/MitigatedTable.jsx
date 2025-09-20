export default function MitigatedTable({ mitigated, fmtTime }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-emerald-500/20 bg-black/30 shadow-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm tracking-widest text-emerald-400 uppercase">Mitigated Alerts</h2>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black/60 backdrop-blur">
              <tr className="text-left text-slate-300">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">IP</th>
                <th className="px-4 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {mitigated.slice().reverse().map((a, i) => (
                <tr key={i} className="border-t border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="px-4 py-2 text-slate-400">{fmtTime(a.time)}</td>
                  <td className="px-4 py-2">{a.ip}</td>
                  <td className="px-4 py-2">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
