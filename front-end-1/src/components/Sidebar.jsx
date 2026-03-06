import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Upload, 
  Clock, 
  Bell, 
  Settings, 
  LogOut,
  Heart,
  X,
  Menu
} from 'lucide-react'

const Sidebar = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 backdrop-blur-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full glass border-r border-white/20 p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ABHA-Sync</h1>
              <p className="text-sm text-gray-500">Healthcare Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`nav-item w-full ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleNavigation('/cost-savings')}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-left">
                <p className="text-sm text-green-600 font-medium">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-700">₹2,450</p>
              </div>
            </button>

            <button
              onClick={() => handleNavigation('/report-explanation')}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-left">
                <p className="text-sm text-amber-600 font-medium">HbA1c Level</p>
                <p className="text-2xl font-bold text-amber-700">8.5%</p>
              </div>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full nav-item text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar