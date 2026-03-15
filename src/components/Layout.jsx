import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus, Search, List, Plus } from 'lucide-react'
import ShortcutsModal from './ShortcutsModal'
import ThemeToggle from './ThemeToggle'

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/log', label: 'Log Fix', icon: FilePlus },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/logs', label: 'My Logs', icon: List },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        setShortcutsOpen((open) => !open)
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/search')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        navigate('/log')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 text-base font-semibold sm:text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            FixLoop <span style={{ color: 'var(--accent)' }}>⚡</span>
          </Link>
          <nav className="flex flex-1 justify-center gap-0.5 overflow-x-auto">
            {nav.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium sm:gap-2 sm:px-3 ${
                  location.pathname === path
                    ? 'bg-[var(--surface)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              to="/log"
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium sm:gap-2 sm:px-3"
              style={{
                background: 'var(--accent)',
                color: 'var(--btn-primary-text)',
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Log Fix</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-6 sm:px-4 sm:py-8">{children}</main>
      <footer className="border-t border-[var(--border)] py-4 text-center text-sm text-[var(--text-muted)]">
        Your data never leaves your browser.
      </footer>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
