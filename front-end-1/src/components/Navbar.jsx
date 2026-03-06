import React from 'react'
import { Bell, Search, User, ChevronDown } from 'lucide-react'
import { mockData } from '../mock/mockData'

const Navbar = ({ onLogout }) => {
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
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search records, medications..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-white/20 rounded-2xl p-4 shadow-2xl z-[60]">
                  <h3 className="font-semibold text-gray-800 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border transition-all duration-300 ${
                          notif.unread 
                            ? 'bg-indigo-50/50 border-indigo-200' 
                            : 'bg-white/30 border-gray-200/50'
                        }`}
                      >
                        <p className="text-sm text-gray-700">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

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
                  <p className="text-sm font-medium text-gray-800">{mockData.user.name}</p>
                  <p className="text-xs text-gray-500">{mockData.user.mobile}</p>
                </div>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-white/20 rounded-2xl p-2 shadow-2xl z-[60]">
                  <div className="p-3 border-b border-gray-200/50">
                    <p className="font-medium text-gray-800">{mockData.user.name}</p>
                    <p className="text-sm text-gray-500">{mockData.user.email}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-300">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-300">
                      Privacy & Security
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-300">
                      Help & Support
                    </button>
                    <hr className="my-2 border-gray-200/50" />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
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