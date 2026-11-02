export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  )
}
