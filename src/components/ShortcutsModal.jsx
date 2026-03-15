import { useEffect } from 'react'
import { X } from 'lucide-react'

const shortcuts = [
  { keys: ['?'], description: 'Show this shortcuts dialog' },
  { keys: ['⌘', 'K'], description: 'Go to Search' },
  { keys: ['⌘', 'N'], description: 'Log a new fix' },
]

export default function ShortcutsModal({ open, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl border p-6 shadow-xl"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 hover:bg-[var(--border)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-3">
          {shortcuts.map(({ keys, description }) => (
            <li key={description} className="flex items-center justify-between gap-4">
              <span style={{ color: 'var(--text-secondary)' }}>{description}</span>
              <span className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border px-2 py-1 font-mono text-sm"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Windows/Linux: use Ctrl instead of ⌘
        </p>
      </div>
    </div>
  )
}
