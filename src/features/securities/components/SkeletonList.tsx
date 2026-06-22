function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-4 h-3 bg-surface rounded flex-shrink-0" />
      <div className="w-10 h-10 rounded-full bg-surface flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-surface rounded w-28" />
        <div className="h-3 bg-surface rounded w-20" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-3.5 bg-surface rounded w-16" />
        <div className="h-3 bg-surface rounded w-10" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-border px-4 bg-white">
      {Array.from({ length: count }).map((_, i) => <SkeletonItem key={i} />)}
    </div>
  )
}
