import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  // Mock login state
  React.useEffect(() => {
    const loginState = localStorage.getItem('isLoggedIn')
    if (loginState === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  if (!isLoggedIn) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
          <Login onLogin={handleLogin} />
        </div>
      </Router>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar onLogout={handleLogout} />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-64">
            <Navbar onLogout={handleLogout} />
            
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
  )
}

export default App