import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const COMMON_TAGS = [
  'react', 'typescript', 'javascript', 'vue', 'node', 'css', 'sql', 'async',
  'vite', 'webpack', 'python', 'git', 'api', 'auth', 'tailwind', 'error',
]

export default function TagInput({ value = [], onChange, suggestions: propSuggestions = [], placeholder = 'Type + Enter to add...' }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const allSuggestions = [...new Set([...COMMON_TAGS, ...propSuggestions].map((t) => t.toLowerCase()))]
  const normalized = input.trim().toLowerCase()
  const filtered =
    normalized.length === 0
      ? allSuggestions.filter((t) => !value.includes(t)).slice(0, 10)
      : allSuggestions.filter((t) => t.includes(normalized) && !value.includes(t)).slice(0, 10)

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput('')
    setOpen(false)
    setHighlight(0)
    inputRef.current?.focus()
  }

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0 && highlight >= 0 && highlight < filtered.length) {
        addTag(filtered[highlight])
        return
      }
      if (input.trim()) {
        addTag(input.trim())
      }
      return
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h < filtered.length - 1 ? h + 1 : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h > 0 ? h - 1 : filtered.length - 1))
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setHighlight(0)
    }
  }

  useEffect(() => {
    setHighlight(0)
    setOpen(input.length > 0 || filtered.length > 0)
  }, [input, filtered.length])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[highlight]
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  return (
    <div className="relative">
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border px-3 py-2 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--tag-bg)',
              color: 'var(--tag-text)',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded p-0.5 hover:bg-[var(--border)] hover:opacity-100"
              style={{ color: 'var(--tag-text)' }}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="min-w-[120px] flex-1 bg-transparent font-mono text-sm focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border py-1 shadow-lg"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {filtered.map((tag, i) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-sm font-mono"
                style={{
                  background: i === highlight ? 'var(--accent-subtle)' : 'transparent',
                  color: i === highlight ? 'var(--accent-text)' : 'var(--text-primary)',
                }}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
