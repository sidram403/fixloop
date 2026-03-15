import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FilePlus, Search, List, Clock, Tag } from 'lucide-react'
import { getAllFixes, seedIfEmpty } from '../db/db'
import samples from '../data/samples.json'
import Skeleton from '../components/Skeleton'

function truncate(str, len = 50) {
  if (!str || str.length <= len) return str
  return str.slice(0, len).trim() + '…'
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [fixes, setFixes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    seedIfEmpty(samples)
      .then(() => getAllFixes())
      .then((list) => setFixes(list || []))
      .catch(() => setFixes([]))
      .finally(() => setLoading(false))
  }, [])

  const totalFixes = fixes.length
  const totalTimeSaved = fixes.reduce((sum, f) => sum + (f.timeLost ?? 0), 0)
  const tagCounts = fixes.reduce((acc, f) => {
    (f.tags || []).forEach((t) => { acc[t] = (acc[t] || 0) + 1 })
    return acc
  }, {})
  const mostUsedTag = Object.keys(tagCounts).length
    ? Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null
  const last5 = fixes.slice(0, 5)
  const isEmpty = !loading && totalFixes === 0

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) navigate('/search', { state: { query: q } })
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Log errors and their fixes. Search later when you hit the same error again.
      </p>

      {/* Big centered search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-10">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your logs..."
            className="w-full rounded-xl border py-3.5 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
          >
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton variant="card" count={1} />
            <Skeleton variant="card" count={1} />
            <Skeleton variant="card" count={1} />
          </div>
          <Skeleton variant="row" count={3} />
        </div>
      ) : isEmpty ? (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Get Started</h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            Log your first error and fix. Next time you see the same error, search and find the solution in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/log"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
            >
              <FilePlus className="h-5 w-5" />
              Log your first fix
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-medium transition hover:bg-[var(--border)]"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <Search className="h-5 w-5" />
              Search
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 3 stat cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5" style={{ background: 'var(--accent-subtle)' }}>
                  <List className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{totalFixes}</p>
                  <p className="text-sm text-[var(--text-muted)]">Total Fixes Logged</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5" style={{ background: 'var(--accent-subtle)' }}>
                  <Clock className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{totalTimeSaved}</p>
                  <p className="text-sm text-[var(--text-muted)]">Total Time Saved (min)</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5" style={{ background: 'var(--accent-subtle)' }}>
                  <Tag className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold truncate text-[var(--text-primary)]" title={mostUsedTag || '—'}>
                    {mostUsedTag || '—'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Most Used Tag</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last 5 entries */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent</h2>
              <Link
                to="/logs"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View all
              </Link>
            </div>
            {last5.length === 0 ? (
              <p className="text-[var(--text-muted)]">No entries yet.</p>
            ) : (
              <ul className="space-y-2">
                {last5.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/logs"
                      state={{ highlightId: f.id }}
                      className="block rounded-lg border p-3 font-mono text-sm transition hover:opacity-90"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                    >
                      {truncate(f.errorMessage, 60)}
                      <span className="mt-1 block text-xs text-[var(--text-muted)]">
                        {formatDate(f.createdAt)}
                        {(f.tags || []).length > 0 && ` · ${(f.tags || []).join(', ')}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
