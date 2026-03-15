import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Minus } from 'lucide-react'

function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str
  return str.slice(0, maxLen).trim() + '…'
}

function getScoreTier(pct) {
  if (pct >= 80) return { label: 'Strong Match', Icon: CheckCircle, style: { background: 'var(--success-subtle)', color: 'var(--success)' } }
  if (pct >= 50) return { label: 'Possible Match', Icon: AlertTriangle, style: { background: 'var(--warning-subtle)', color: 'var(--warning)' } }
  return { label: 'Weak Match', Icon: Minus, style: { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' } }
}

export default function SearchResultCard({ fix, score }) {
  const [expanded, setExpanded] = useState(false)
  const matchPct = Math.round((1 - Math.min(score, 1)) * 100)
  const tier = getScoreTier(matchPct)
  const errorPreview = truncate(fix.errorMessage, 80)
  const fixPreview = truncate(fix.fix, 100)

  return (
    <article
      className="rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium"
          style={tier.style}
        >
          <tier.Icon className="h-4 w-4" />
          {matchPct}% match
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tier.label}</span>
      </div>
      <pre
        className="font-mono mb-2 whitespace-pre-wrap break-words rounded border px-3 py-2 text-sm"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {expanded ? fix.errorMessage : errorPreview}
      </pre>
      <div
        className="rounded border px-3 py-2 font-mono text-sm"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {expanded ? fix.fix : fixPreview}
      </div>
      {fix.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fix.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-2 py-0.5 text-xs font-mono"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--tag-bg)',
                color: 'var(--tag-text)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View Full Fix
          </>
        )}
      </button>
    </article>
  )
}
