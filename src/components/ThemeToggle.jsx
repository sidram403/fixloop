import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [tooltip, setTooltip] = useState(false)
  const isDark = theme === 'dark'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleTheme}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-[background-color,border-color,color] duration-200 hover:bg-[var(--bg-tertiary)]"
        style={{
          background: 'transparent',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {tooltip && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium shadow-lg"
          style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        </div>
      )}
    </div>
  )
}
