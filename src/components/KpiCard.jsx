import { FiArrowUpRight } from 'react-icons/fi'

export function KpiCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <FiArrowUpRight className="h-4 w-4 text-emerald-500" />
        <span>{hint}</span>
      </div>
    </div>
  )
}
