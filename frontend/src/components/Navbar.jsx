import React from 'react'
import { Bell, Search, User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Navbar = ({ onLogout }) => {
  const { user } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)

  const notifications = [
    { id: 1, text: "Metformin reminder in 30 minutes", time: "2 mins ago", unread: true },
    { id: 2, text: "Lab results uploaded successfully", time: "1 hour ago", unread: true },
    { id: 3, text: "Cost savings update available", time: "3 hours ago", unread: false }
  ]

  return (
    <>
      {/* Click outside handler - must be outside nav to avoid backdrop-filter containing block */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        />
      )}

      <nav className="glass border-b border-white/20 p-4 lg:p-6 relative z-50">
        <div className="flex items-center justify-between">
          {/* Search Bar - Removed as per request */}
          <div className="flex-1 max-w-md">
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications - Removed as per request */}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.email ? user.email.split('@')[0] : 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">{user?.email || ''}</p>
                </div>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-white/20 rounded-2xl p-2 shadow-2xl z-[60]">
                  <div className="p-3 border-b border-gray-200/50">
                    <p className="font-medium text-gray-800 truncate">
                      {user?.email ? user.email.split('@')[0] : 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
                    {user?.abha_number && (
                      <p className="text-xs text-indigo-600 mt-0.5">ABHA: {user.abha_number}</p>
                    )}
                  </div>
                  <div className="py-2">
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full block text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-300"
                    >
                      Profile
                    </Link>
                    <hr className="my-2 border-gray-200/50" />
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar