import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PageTitle from './components/PageTitle'
import SampleBanner from './components/SampleBanner'
import Dashboard from './pages/Dashboard'
import LogFix from './pages/LogFix'
import SearchLogs from './pages/SearchLogs'
import AllLogs from './pages/AllLogs'
import { seedIfEmpty } from './db/db'
import samples from './data/samples.json'

export default function App() {
  const [showSampleBanner, setShowSampleBanner] = useState(false)

  useEffect(() => {
    seedIfEmpty(samples).then((seeded) => setShowSampleBanner(seeded))
  }, [])

  return (
    <Layout>
      <PageTitle />
      {showSampleBanner && (
        <SampleBanner onDismiss={() => setShowSampleBanner(false)} />
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogFix />} />
        <Route path="/search" element={<SearchLogs />} />
        <Route path="/logs" element={<AllLogs />} />
      </Routes>
    </Layout>
  )
}
