import { useState } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'fixloop-sample-banner-dismissed'

export default function SampleBanner({ onDismiss }) {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div
      role="status"
      className="mb-6 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
      }}
    >
      <span>👋 Sample data loaded. Replace with your own fixes.</span>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded p-1.5 hover:bg-[var(--bg-tertiary)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
