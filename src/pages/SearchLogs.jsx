import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import Fuse from 'fuse.js'
import { getAllFixes, seedIfEmpty } from '../db/db'
import samples from '../data/samples.json'
import { fingerprint } from '../utils/fingerprint'
import SearchResultCard from '../components/SearchResultCard'
import Skeleton from '../components/Skeleton'

const MIN_CHARS = 3
const TOP_N = 5

const fuseOptions = {
  keys: [
    { name: 'errorMessage', weight: 0.8 },
    { name: 'tags', weight: 0.2 },
  ],
  threshold: 0.5,
  includeScore: true,
}

function runSearch(fixes, query) {
  const q = query.trim()
  if (!q || fixes.length === 0) return []
  const normalized = fingerprint(q)
  const searchText = normalized.length > 0 ? normalized : q
  const fuse = new Fuse(fixes, fuseOptions)
  const byNormalized = fuse.search(searchText)
  const byRaw = searchText !== q ? fuse.search(q) : []
  const byScore = new Map()
  for (const { item, score } of byNormalized) {
    const s = score ?? 1
    if (!byScore.has(item.id) || (byScore.get(item.id).score > s)) {
      byScore.set(item.id, { item, score: s })
    }
  }
  for (const { item, score } of byRaw) {
    const s = score ?? 1
    if (!byScore.has(item.id) || (byScore.get(item.id).score > s)) {
      byScore.set(item.id, { item, score: s })
    }
  }
  return [...byScore.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, TOP_N)
}

export default function SearchLogs() {
  const location = useLocation()
  const initialQuery = location.state?.query ?? ''
  const [fixes, setFixes] = useState([])
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seedIfEmpty(samples)
      .then(() => getAllFixes())
      .then(setFixes)
      .catch(() => setFixes([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])

  const showResults = query.trim().length >= MIN_CHARS
  const results = useMemo(() => {
    if (!showResults) return []
    return runSearch(fixes, query)
  }, [fixes, query, showResults])

  const hasResults = results.length > 0

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Search Your Logs</h1>
      <p className="mb-6 text-[var(--text-secondary)]">
        Paste your current error to find a past fix instantly.
      </p>

      <div className="mb-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste error here..."
          rows={6}
          className="font-mono w-full rounded-xl border px-4 py-3 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
        />
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            disabled={!query.trim()}
            onClick={() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
          >
            <Search className="h-4 w-4" />
            Search My Logs
          </button>
        </div>
      </div>

      <div id="search-results" className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Results
        </h2>

        {loading ? (
          <Skeleton variant="card" count={3} />
        ) : !showResults ? (
          <p className="text-[var(--text-muted)]">
            Type or paste an error (3+ characters) to search. We match against normalized error text and tags.
          </p>
        ) : hasResults ? (
          <ul className="space-y-4">
            {results.map(({ item, score }) => (
              <li key={item.id}>
                <SearchResultCard fix={item} score={score} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="mb-4 text-[var(--text-secondary)]">
              No matches found in your logs.
              <br />
              Once you fix this — log it so you&apos;ll have it next time.
            </p>
            <Link
              to="/log"
              state={{ errorMessage: query.trim() }}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
            >
              <Plus className="h-4 w-4" />
              Log This Fix
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
