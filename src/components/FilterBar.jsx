const presets = [
  { value: 'allTime', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

export function FilterBar({ preset, onPresetChange, customStart, customEnd, onCustomStartChange, onCustomEndChange }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onPresetChange(item.value)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                preset === item.value
                  ? 'bg-slate-900 text-white shadow dark:bg-cyan-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {preset === 'custom' ? (
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span>From</span>
              <input
                type="date"
                value={customStart}
                onChange={(event) => onCustomStartChange(event.target.value)}
                className="bg-transparent outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span>To</span>
              <input
                type="date"
                value={customEnd}
                onChange={(event) => onCustomEndChange(event.target.value)}
                className="bg-transparent outline-none"
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  )
}
