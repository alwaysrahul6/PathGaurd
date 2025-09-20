export default function KPI({ icon: Icon, label, value, danger }) {
  const classNames = (...c) => c.filter(Boolean).join(" ");
  return (
    <div className={classNames("rounded-2xl border p-4 bg-black/30 shadow-xl", danger ? "border-red-500/30" : "border-emerald-500/20")}>
      <div className="flex items-center gap-3">
        <div className={classNames("rounded-xl p-2", danger ? "bg-red-500/10" : "bg-emerald-500/10")}>
          <Icon className={classNames("h-6 w-6", danger ? "text-red-400" : "text-emerald-400")} />
        </div>
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-widest">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}
