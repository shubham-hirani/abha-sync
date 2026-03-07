import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { RecordsProvider } from './context/RecordsContext'

// Layout Components
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import ReviewExtraction from './pages/ReviewExtraction'
import CostSavings from './pages/CostSavings'
import ReportExplanation from './pages/ReportExplanation'
import Timeline from './pages/Timeline'
import Consent from './pages/Consent'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'

// ─── Loading Screen ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading ABHA-Sync…</p>
      </div>
    </div>
  )
}

// ─── Inner App (has access to AuthContext) ───────────────────────────────────
function AppInner() {
  const { isAuthenticated, loading, logout } = useAuth()

  if (loading) return <LoadingScreen />

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    )
  }

  return (
    <RecordsProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
          <div className="flex">
            <Sidebar onLogout={logout} />
            <div className="flex-1 lg:ml-64">
              <Navbar onLogout={logout} />
              <main className="p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/review-extraction" element={<ReviewExtraction />} />
                  <Route path="/cost-savings" element={<CostSavings />} />
                  <Route path="/report-explanation" element={<ReportExplanation />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/consent" element={<Consent />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </RecordsProvider>
  )
}

// ─── Root App ────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App