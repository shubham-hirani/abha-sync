import React from 'react'
import { 
  Globe, 
  Bell, 
  Moon, 
  Shield, 
  User, 
  Smartphone,
  Mail,
  Lock,
  Download,
  Trash2,
  Check,
  Info,
  Heart
} from 'lucide-react'

import { mockData } from '../mock/mockData'

const Settings = () => {
  const [settings, setSettings] = React.useState(mockData.settings)
  const [userProfile, setUserProfile] = React.useState(mockData.user)
  const [saved, setSaved] = React.useState(false)
  
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Show saved indicator
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  
  const handleProfileChange = (key, value) => {
    setUserProfile(prev => ({ ...prev, [key]: value }))
  }

  const languages = [
    { code: 'English', name: 'English' },
    { code: 'Hindi', name: 'हिन्दी (Hindi)' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
    { code: 'Marathi', name: 'मराठी (Marathi)' },
    { code: 'Bengali', name: 'বাংলা (Bengali)' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account, preferences, and privacy settings
        </p>
      </div>

      {/* Saved Indicator */}
      {saved && (
        <div className="fixed top-24 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce-slow">
          <Check className="w-4 h-4" />
          Settings saved
        </div>
      )}

      {/* Profile Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            <p className="text-gray-500">Update your personal details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={userProfile.mobile}
                onChange={(e) => handleProfileChange('mobile', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ABHA ID
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={userProfile.abhaId}
                onChange={(e) => handleProfileChange('abhaId', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Globe className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">App Preferences</h2>
            <p className="text-gray-500">Customize your app experience</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Language / भाषा
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Theme */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark theme for better viewing in low light</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
            <p className="text-gray-500">Control when and how you receive notifications</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">General Notifications</p>
              <p className="text-sm text-gray-500">App updates, health insights, and system messages</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Reminder Sound</p>
              <p className="text-sm text-gray-500">Play sound for medication reminders</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reminderSound}
                onChange={(e) => handleSettingChange('reminderSound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Auto Upload to ABHA</p>
              <p className="text-sm text-gray-500">Automatically upload processed records to your ABHA account</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoUpload}
                onChange={(e) => handleSettingChange('autoUpload', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Data & Privacy</h2>
            <p className="text-gray-500">Manage your data and privacy settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">Download My Data</p>
                <p className="text-sm text-gray-500">Export all your health records and data</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">Privacy Controls</p>
                <p className="text-sm text-gray-500">Manage who can access your health information</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-red-200 hover:border-red-300 rounded-xl transition-all duration-300 text-red-600">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-red-500">Permanently delete your account and data</p>
              </div>
            </div>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-100 rounded-xl">
            <Info className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">About ABHA-Sync</h2>
            <p className="text-gray-500">App information and legal</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">App Version</span>
            <span className="font-medium text-gray-800">2.1.0</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium text-gray-800">Feb 20, 2024</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-4">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-600 text-sm">Made with care for better healthcare</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings