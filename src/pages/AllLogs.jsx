import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Pencil, Trash2, Download, Upload, Plus } from 'lucide-react'
import { getAllFixes, deleteFix, exportAllFixes, importFixes, seedIfEmpty } from '../db/db'
import samples from '../data/samples.json'
import { useToast } from '../context/ToastContext'
import Skeleton, { SkeletonListRow } from '../components/Skeleton'

function truncate(str, len = 60) {
  if (!str || str.length <= len) return str
  return str.slice(0, len).trim() + '…'
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AllLogs() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [fixes, setFixes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [importing, setImporting] = useState(false)

  const load = () =>
    seedIfEmpty(samples)
      .then(() => getAllFixes())
      .then(setFixes)
      .catch(() => setFixes([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const highlightId = location.state?.highlightId
  useEffect(() => {
    if (highlightId && fixes.length > 0) {
      setExpandedId(highlightId)
      const el = document.getElementById(`log-row-${highlightId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [highlightId, fixes.length])

  const allTags = useMemo(() => {
    const set = new Set()
    fixes.forEach((f) => (f.tags || []).forEach((t) => set.add(t)))
    return [...set].sort()
  }, [fixes])

  const filtered = useMemo(() => {
    let list = fixes
    if (tagFilter) {
      list = list.filter((f) => (f.tags || []).includes(tagFilter))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (f) =>
          (f.errorMessage || '').toLowerCase().includes(q) ||
          (f.fix || '').toLowerCase().includes(q) ||
          (f.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [fixes, search, tagFilter])

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!window.confirm('Delete this fix?')) return
    await deleteFix(id)
    setFixes((prev) => prev.filter((f) => f.id !== id))
    if (expandedId === id) setExpandedId(null)
    toast('Fix deleted', 'success')
  }

  const handleEdit = (fix, e) => {
    e?.stopPropagation()
    navigate('/log', { state: { edit: fix } })
  }

  const handleExport = async () => {
    try {
      const json = await exportAllFixes()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fixloop-logs-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Exported successfully', 'success')
    } catch {
      toast('Export failed', 'error')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async (e) => {
      const file = e.target?.files?.[0]
      if (!file) return
      setImporting(true)
      try {
        const text = await file.text()
        const { added } = await importFixes(text)
        await load()
        toast(added > 0 ? `Imported ${added} fix(es)` : 'No valid fixes in file', 'success')
      } catch (err) {
        toast(err.message || 'Import failed', 'error')
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">My Logs</h1>
      <p className="mb-6 text-[var(--text-secondary)]">All fixes stored in this browser. Filter, edit, or export.</p>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-[var(--border)] disabled:opacity-50"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Importing…' : 'Import JSON'}
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-[var(--text-muted)]">Filter by tag:</span>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTagFilter((prev) => (prev === t ? null : t))}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                tagFilter === t
                  ? 'bg-[var(--accent)] text-[var(--btn-primary-text)]'
                  : 'border bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
              style={tagFilter === t ? {} : { borderColor: 'var(--border)' }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="mb-4 text-[var(--text-secondary)]">
            {fixes.length === 0
              ? 'No fixes logged yet.'
              : 'No logs match your filter.'}
          </p>
          {fixes.length === 0 && (
            <Link
              to="/log"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
            >
              <Plus className="h-4 w-4" />
              Log your first fix
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((fix) => (
            <li key={fix.id} id={`log-row-${fix.id}`}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId((id) => (id === fix.id ? null : fix.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpandedId((id) => (id === fix.id ? null : fix.id))
                  }
                }}
                className="cursor-pointer rounded-lg border transition hover:opacity-90"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="flex flex-wrap items-center gap-2 p-4 sm:gap-4">
                  <p className="min-w-0 flex-1 font-mono text-sm text-[var(--text-primary)]">
                    {truncate(fix.errorMessage, 70)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {(fix.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border px-2 py-0.5 text-xs font-mono"
                      style={{ borderColor: 'var(--border)', background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
                      >
                        {t}
                      </span>
                    ))}
                    {fix.timeLost != null && (
                      <span className="text-xs text-[var(--text-muted)]">{fix.timeLost} min</span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(fix.createdAt)}</span>
                    <button
                      type="button"
                      onClick={(e) => handleEdit(fix, e)}
                      className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--accent)]"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(fix.id, e)}
                      className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedId === fix.id && (
                  <div className="border-t px-4 pb-4 pt-2" style={{ borderColor: 'var(--border)' }}>
                    <pre className="font-mono mb-3 whitespace-pre-wrap break-words rounded p-3 text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      {fix.errorMessage}
                    </pre>
                    <div className="font-mono rounded p-3 text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      {fix.fix}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
