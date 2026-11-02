import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiRefreshCcw, FiTrendingUp } from 'react-icons/fi'
import { formatCurrency } from '../utils/analytics'
import { KpiCard } from '../components/KpiCard'
import { FilterBar } from '../components/FilterBar'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { PaymentsTable } from '../components/PaymentsTable'
import { RevenueTrendChart } from '../charts/RevenueTrendChart'
import { BarChartCard } from '../charts/BarChartCard'
import { PieChartCard } from '../charts/PieChartCard'
import { usePayments } from '../hooks/usePayments'
import {
  averageTransaction,
  buildDateSeries,
  buildPieSeries,
  filterByDateRange,
  getDateRangeForPreset,
  groupByDate,
  makeBreakdownSeries,
  sumRevenue,
  successRate,
} from '../utils/analytics'
import { addDays, differenceInCalendarDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns'

const KPI_CARDS = [
  { key: 'total', label: 'Total Revenue' },
  { key: 'today', label: "Today's Revenue" },
  { key: 'yesterday', label: "Yesterday's Revenue" },
  { key: 'week', label: 'This Week Revenue' },
  { key: 'month', label: 'This Month Revenue' },
  { key: 'transactions', label: 'Total Transactions' },
  { key: 'successRate', label: 'Success Rate' },
  { key: 'average', label: 'Average Transaction' },
]

export function DashboardPage() {
  const { payments, loading, error, refetch } = usePayments()
  const [preset, setPreset] = useState('last7')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [searchText, setSearchText] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const currentDate = useMemo(() => new Date(), [])
  const activePayments = payments
  const activeLoading = loading
  const activeError = error

  const dateRange = useMemo(() => {
    if (preset === 'custom') {
      return {
        start: customStart ? startOfDay(new Date(customStart)) : null,
        end: customEnd ? endOfDay(new Date(customEnd)) : null,
      }
    }
    return getDateRangeForPreset(preset, currentDate)
  }, [preset, customStart, customEnd, currentDate])

  const filteredPayments = useMemo(
    () => filterByDateRange(activePayments, dateRange.start, dateRange.end),
    [activePayments, dateRange],
  )

  const displayPayments = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    const filtered = filteredPayments.filter((payment) => {
      if (!normalizedSearch) return true
      return [payment.email, payment.transaction_ref]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })

    const sorted = [...filtered].sort((a, b) => {
      const aValue = sortKey === 'amount' ? Number(a.amount || 0) : new Date(a._createdDate).getTime()
      const bValue = sortKey === 'amount' ? Number(b.amount || 0) : new Date(b._createdDate).getTime()

      if (aValue === bValue) return 0
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sorted
  }, [filteredPayments, searchText, sortKey, sortOrder])

  useEffect(() => {
    setPage(1)
  }, [preset, customStart, customEnd, searchText])

  const todayRevenue = useMemo(
    () => sumRevenue(filterByDateRange(filteredPayments, startOfDay(currentDate), endOfDay(currentDate))),
    [filteredPayments, currentDate],
  )
  const yesterdayRevenue = useMemo(
    () => sumRevenue(filterByDateRange(filteredPayments, startOfDay(subDays(currentDate, 1)), endOfDay(subDays(currentDate, 1)))),
    [filteredPayments, currentDate],
  )
  const weekRevenue = useMemo(
    () => sumRevenue(filterByDateRange(filteredPayments, startOfWeek(currentDate, { weekStartsOn: 1 }), endOfWeek(currentDate, { weekStartsOn: 1 }))),
    [filteredPayments, currentDate],
  )
  const monthRevenue = useMemo(
    () => sumRevenue(filterByDateRange(filteredPayments, startOfMonth(currentDate), endOfMonth(currentDate))),
    [filteredPayments, currentDate],
  )

  const metrics = useMemo(
    () => ({
      total: sumRevenue(filteredPayments),
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      transactions: filteredPayments.length,
      successRate: successRate(filteredPayments),
      average: averageTransaction(filteredPayments),
    }),
    [filteredPayments, todayRevenue, yesterdayRevenue, weekRevenue, monthRevenue],
  )

  const revenueTrendData = useMemo(() => {
    const grouped = groupByDate(filteredPayments, { status: 'success' })
    const start = dateRange.start || subDays(currentDate, 29)
    const end = dateRange.end || currentDate
    return buildDateSeries(grouped, start, end)
  }, [filteredPayments, dateRange, currentDate])

  const weeklyRevenueData = useMemo(() => {
    const grouped = groupByDate(filteredPayments, { status: 'success' })
    const rangeEnd = dateRange.end || currentDate
    const rangeStart = dateRange.start
      ? addDays(rangeEnd, Math.max(-6, -differenceInCalendarDays(rangeEnd, dateRange.start)))
      : subDays(currentDate, 6)

    return buildDateSeries(grouped, rangeStart, rangeEnd)
  }, [filteredPayments, currentDate, dateRange])

  const statusData = useMemo(() => buildPieSeries(makeBreakdownSeries(filteredPayments, 'status', () => 1)), [filteredPayments])
  const methodData = useMemo(
    () => buildPieSeries(makeBreakdownSeries(filteredPayments, 'payment_method', (payment) => Number(payment.amount || 0))),
    [filteredPayments],
  )
  const planData = useMemo(
    () => buildPieSeries(makeBreakdownSeries(filteredPayments, 'planName', (payment) => Number(payment.amount || 0))),
    [filteredPayments],
  )
  const countryData = useMemo(
    () => buildPieSeries(makeBreakdownSeries(filteredPayments, 'country', (payment) => Number(payment.amount || 0))),
    [filteredPayments],
  )

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">Payment analytics</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Wix payments dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Upload a Wix CSV export to power your dashboard with payment trends, revenue charts, and customer analytics.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <FiRefreshCcw /> Refresh
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <FiDownload /> Export
              </button>
            </div>
          </div>
        </header>

        <FilterBar
          preset={preset}
          onPresetChange={setPreset}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />

        {activeLoading ? (
          <LoadingSkeleton />
        ) : activeError ? (
          <div className="rounded-3xl border border-rose-200/80 bg-rose-50/80 p-8 text-center text-slate-900 shadow-sm dark:border-rose-500/30 dark:bg-rose-900/20 dark:text-rose-100">
            <p className="text-lg font-semibold">Unable to load payments</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{activeError}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {KPI_CARDS.map((item, index) => {
                let value = '—'
                let hint = 'Updated from selected range'

                switch (item.key) {
                  case 'total':
                    value = formatCurrency(metrics.total)
                    break
                  case 'today':
                    value = formatCurrency(metrics.today)
                    break
                  case 'yesterday':
                    value = formatCurrency(metrics.yesterday)
                    break
                  case 'week':
                    value = formatCurrency(metrics.week)
                    break
                  case 'month':
                    value = formatCurrency(metrics.month)
                    break
                  case 'transactions':
                    value = metrics.transactions
                    hint = 'Transactions inside filters'
                    break
                  case 'successRate':
                    value = `${metrics.successRate.toFixed(1)}%`
                    hint = 'Successful payments ratio'
                    break
                  case 'average':
                    value = formatCurrency(metrics.average)
                    hint = 'Average successful payment'
                    break
                  default:
                    break
                }

                return (
                  <KpiCard
                    key={item.key}
                    label={item.label}
                    value={value}
                    hint={hint}
                    icon={index === 0 ? FiTrendingUp : null}
                  />
                )
              })}
            </section>

            <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/65">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue over time</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Success revenue grouped by day.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {preset === 'custom' ? 'Custom range' : preset.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
                <RevenueTrendChart data={revenueTrendData} />
              </div>

              <div className="grid gap-4">
                <BarChartCard title="Weekly revenue" data={weeklyRevenueData} color="#0f766e" />
                <PieChartCard title="Payment status distribution" data={statusData} />
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <PieChartCard title="Payment methods" data={methodData} />
              <BarChartCard title="Plans revenue" data={planData} color="#2563eb" />
              <BarChartCard title="Country revenue" data={countryData} color="#9333ea" />
            </section>

            <PaymentsTable
              payments={displayPayments}
              searchText={searchText}
              onSearchChange={setSearchText}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSortChange={(key, order) => {
                setSortKey(key)
                setSortOrder(order)
              }}
              page={page}
              pageSize={8}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
