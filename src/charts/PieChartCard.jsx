import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../utils/analytics'

const PIE_COLORS = ['#0f766e', '#0284c7', '#f97316', '#e11d48', '#a855f7', '#14b8a6']

export function PieChartCard({ title, data }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/65">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              label={({ name }) => name}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value, 'RWF')} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
