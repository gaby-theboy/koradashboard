import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { formatCurrency, formatShortDate, getStatusBadgeClass } from '../utils/analytics'

export function PaymentsTable({
  payments,
  searchText,
  onSearchChange,
  sortKey,
  sortOrder,
  onSortChange,
  page,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(payments.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const pageItems = payments.slice(startIndex, startIndex + pageSize)

  const handleSort = (key) => {
    const nextOrder = sortKey === key && sortOrder === 'desc' ? 'asc' : 'desc'
    onSortChange(key, nextOrder)
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent payments</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search records, sort values and browse transactions.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by email or reference"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-sm text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Plan</th>
              <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('amount')}>
                Amount {sortKey === 'amount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
              <th className="cursor-pointer px-4 py-3" onClick={() => handleSort('date')}>
                Date {sortKey === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  No payments matched your filters.
                </td>
              </tr>
            ) : (
              pageItems.map((payment) => (
                <tr key={payment.transaction_ref || payment._createdDate} className="rounded-3xl border border-slate-200/80 bg-slate-50 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <td className="whitespace-nowrap px-4 py-4 font-medium">{payment.email || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">{payment.telefone || '—'}</td>
                  <td className="px-4 py-4">{payment.planName || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-4">{payment.payment_method || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(payment.status)}`}>
                      {String(payment.status || 'Unknown').toUpperCase()}
                    </span>
                  </td>
                  <td className="break-words px-4 py-4 max-w-[180px]">{payment.transaction_ref || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">{formatShortDate(payment._createdDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {pageItems.length} of {payments.length} transactions
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <FiChevronLeft />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
