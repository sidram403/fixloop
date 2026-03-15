import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'Dashboard',
  '/log': 'Log a Fix',
  '/search': 'Search',
  '/logs': 'My Logs',
}

export default function PageTitle() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'FixLoop'
  useEffect(() => {
    document.title = title === 'FixLoop' ? 'FixLoop' : `${title} · FixLoop`
    return () => {
      document.title = 'FixLoop'
    }
  }, [title])
  return null
}
