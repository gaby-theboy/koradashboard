import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'

export function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCurrency(value, currency = 'RWF') {
  const safeValue = Number(value || 0)
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: currency || 'RWF',
    maximumFractionDigits: 0,
  }).format(safeValue)
}

export function formatShortDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  return format(date, 'MMM d, yyyy')
}

export function formatDateKey(value) {
  const date = toDate(value)
  if (!date) return '—'
  return format(date, 'yyyy-MM-dd')
}

export function sumRevenue(payments, { status = 'success' } = {}) {
  return payments.reduce((total, payment) => {
    const normalizedStatus = String(payment?.status ?? '').toLowerCase()
    if (normalizedStatus !== String(status).toLowerCase()) return total
    return total + Number(payment?.amount || 0)
  }, 0)
}

export function groupByDate(payments, { status = 'success' } = {}) {
  return payments.reduce((groups, payment) => {
    const normalizedStatus = String(payment?.status ?? '').toLowerCase()
    if (normalizedStatus !== String(status).toLowerCase()) return groups

    const date = toDate(payment?._createdDate)
    if (!date) return groups

    const key = formatDateKey(date)
    groups[key] = (groups[key] || 0) + Number(payment?.amount || 0)
    return groups
  }, {})
}

export function groupByWeek(payments, { status = 'success' } = {}) {
  return payments.reduce((groups, payment) => {
    const normalizedStatus = String(payment?.status ?? '').toLowerCase()
    if (normalizedStatus !== String(status).toLowerCase()) return groups

    const date = toDate(payment?._createdDate)
    if (!date) return groups

    const start = startOfWeek(date, { weekStartsOn: 1 })
    const key = `${format(start, 'MMM d')} – ${format(endOfWeek(date, { weekStartsOn: 1 }), 'MMM d')}`
    groups[key] = (groups[key] || 0) + Number(payment?.amount || 0)
    return groups
  }, {})
}

export function successRate(payments) {
  if (!payments.length) return 0
  const successful = payments.filter((payment) => String(payment?.status ?? '').toLowerCase() === 'success')
  return (successful.length / payments.length) * 100
}

export function averageTransaction(payments, { status = 'success' } = {}) {
  const filtered = payments.filter((payment) => {
    const normalizedStatus = String(payment?.status ?? '').toLowerCase()
    return normalizedStatus === String(status).toLowerCase()
  })

  if (!filtered.length) return 0
  return sumRevenue(filtered, { status }) / filtered.length
}

export function filterByDateRange(payments, startDate, endDate) {
  if (!startDate && !endDate) return payments

  const start = startDate ? startOfDay(toDate(startDate)) : null
  const end = endDate ? endOfDay(toDate(endDate)) : null

  return payments.filter((payment) => {
    const date = toDate(payment?._createdDate)
    if (!date) return false

    if (start && date < start) return false
    if (end && date > end) return false
    return true
  })
}

export function getDateRangeForPreset(preset, currentDate = new Date()) {
  const today = currentDate
  switch (preset) {
    case 'allTime':
      return { start: null, end: null }
    case 'today':
      return { start: startOfDay(today), end: endOfDay(today) }
    case 'yesterday': {
      const yesterday = subDays(today, 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    }
    case 'last7': {
      const start = subDays(today, 6)
      return { start: startOfDay(start), end: endOfDay(today) }
    }
    case 'last30': {
      const start = subDays(today, 29)
      return { start: startOfDay(start), end: endOfDay(today) }
    }
    case 'thisMonth':
      return { start: startOfMonth(today), end: endOfMonth(today) }
    case 'custom':
      return { start: null, end: null }
    default:
      return { start: null, end: null }
  }
}

export function getStatusBadgeClass(status) {
  switch (String(status ?? '').toLowerCase()) {
    case 'success':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    case 'failed':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
    case 'pending':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    default:
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
  }
}

export function buildChartSeries(groupedData) {
  return Object.entries(groupedData)
    .map(([key, value]) => ({
      name: key,
      value,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function buildRollingRevenueSeries(groupedData, days = 7, today = new Date()) {
  const series = []
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = subDays(today, index)
    const key = format(day, 'yyyy-MM-dd')
    series.push({
      name: format(day, 'MMM d'),
      value: groupedData[key] || 0,
    })
  }
  return series
}

export function buildDateSeries(groupedData, startDate, endDate) {
  const start = toDate(startDate)
  const end = toDate(endDate)
  if (!start || !end || start > end) return []

  const days = differenceInCalendarDays(end, start) + 1
  const series = []
  for (let index = 0; index < days; index += 1) {
    const day = addDays(start, index)
    const key = format(day, 'yyyy-MM-dd')
    series.push({
      name: format(day, 'MMM d'),
      value: groupedData[key] || 0,
    })
  }
  return series
}

function normalizePlanName(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return 'Others'

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

  if (['basic', 'basic plan', 'basicplan'].includes(normalized)) return 'Basic Plan'
  if (['classic', 'classic plan', 'classicplan'].includes(normalized)) return 'Classic Plan'
  if (['premium', 'premium plan', 'premiumplan'].includes(normalized)) return 'Premium Plan'
  if (['standard', 'standard plan', 'standardplan'].includes(normalized)) return 'Standard Plan'

  return trimmed
}

export function makeBreakdownSeries(payments, keyName, valueSelector) {
  return payments.reduce((groups, payment) => {
    const rawKey = String(payment?.[keyName] || 'Others').trim() || 'Others'
    const key = keyName === 'planName' ? normalizePlanName(rawKey) : rawKey
    groups[key] = (groups[key] || 0) + Number(valueSelector(payment) || 0)
    return groups
  }, {})
}

export function buildPieSeries(groupedData) {
  return Object.entries(groupedData).map(([name, value]) => ({
    name,
    value,
  }))
}

export function createRangeLabel(preset, currentDate = new Date()) {
  const today = currentDate
  switch (preset) {
    case 'today':
      return `Today · ${format(today, 'MMM d, yyyy')}`
    case 'yesterday':
      return `Yesterday · ${format(subDays(today, 1), 'MMM d, yyyy')}`
    case 'last7':
      return `Last 7 days`
    case 'last30':
      return `Last 30 days`
    case 'thisMonth':
      return `This month`
    case 'custom':
      return 'Custom range'
    case 'allTime':
      return 'All time'
    default:
      return 'All time'
  }
}

export function isDateInRange(date, start, end) {
  if (!date) return false
  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

export function getMetricForRange(payments, preset, currentDate = new Date()) {
  const { start, end } = getDateRangeForPreset(preset, currentDate)
  const filtered = filterByDateRange(payments, start, end)
  return {
    revenue: sumRevenue(filtered),
    today: sumRevenue(filterByDateRange(filtered, startOfDay(currentDate), endOfDay(currentDate))),
    yesterday: sumRevenue(filterByDateRange(filtered, startOfDay(subDays(currentDate, 1)), endOfDay(subDays(currentDate, 1)))),
    week: sumRevenue(filterByDateRange(filtered, startOfWeek(currentDate, { weekStartsOn: 1 }), endOfWeek(currentDate, { weekStartsOn: 1 }))),
    month: sumRevenue(filterByDateRange(filtered, startOfMonth(currentDate), endOfMonth(currentDate))),
    totalTransactions: filtered.length,
    successRate: successRate(filtered),
    average: averageTransaction(filtered),
  }
}
