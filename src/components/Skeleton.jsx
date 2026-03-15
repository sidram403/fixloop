export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`h-4 animate-pulse rounded ${className}`}
      style={{ background: 'var(--border)' }}
      aria-hidden
    />
  )
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-3 flex gap-2">
        <SkeletonLine className="h-12 flex-1" />
        <SkeletonLine className="h-12 w-16" />
      </div>
      <SkeletonLine className="mb-2 h-4 w-3/4" />
      <SkeletonLine className="mb-2 h-4 w-full" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  )
}

export function SkeletonListRow() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <SkeletonLine className="h-5 w-2/3 flex-1" />
      <div className="flex gap-2">
        <SkeletonLine className="h-6 w-12 rounded-full" />
        <SkeletonLine className="h-6 w-12 rounded-full" />
      </div>
      <SkeletonLine className="h-4 w-16" />
      <SkeletonLine className="h-4 w-24" />
    </div>
  )
}

export default function Skeleton({ variant = 'card', count = 1 }) {
  const Comp = variant === 'row' ? SkeletonListRow : SkeletonCard
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <Comp key={i} />
      ))}
    </div>
  )
}
