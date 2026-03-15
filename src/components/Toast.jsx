import { useEffect } from 'react'

export default function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-fixloop-border bg-fixloop-card px-4 py-3 text-sm font-medium text-slate-200 shadow-lg"
    >
      {message}
    </div>
  )
}
