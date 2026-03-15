import { Trash2, Clock } from 'lucide-react'

export default function FixCard({ fix, onDelete }) {
  const created = fix.createdAt
    ? new Date(fix.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

  return (
    <article
      className="rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <pre
            className="font-mono whitespace-pre-wrap break-words rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            {fix.errorMessage}
          </pre>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 rounded p-1.5 hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div
        className="mb-2 rounded border px-3 py-2 font-mono text-sm"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {fix.fix}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{created}</span>
        {fix.timeLost != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {fix.timeLost} min
          </span>
        )}
        {fix.tags?.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {fix.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border px-2 py-0.5 font-mono text-[11px]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--tag-bg)',
                  color: 'var(--tag-text)',
                }}
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </div>
    </article>
  )
}
