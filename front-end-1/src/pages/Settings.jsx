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
  Info,
  Heart
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { BetaFeature, BetaBlock } from '../components/BetaFeature'

const Settings = () => {
  const { user } = useAuth()

  const languages = [
    { code: 'English', name: 'English' },
    { code: 'Hindi', name: 'हिन्दी (Hindi)' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' }
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

      {/* Profile Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            <p className="text-gray-500">Your personal details securely stored</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BetaBlock tooltip="Profile update available soon.">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </BetaBlock>

          <BetaBlock tooltip="Profile update available soon.">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ABHA ID</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={user?.abha_number || ''}
                  readOnly
                  placeholder="Link your ABHA ID"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </BetaBlock>

          <BetaBlock tooltip="Profile update available soon.">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={user?.phone_number || ''}
                  readOnly
                  placeholder="Not set"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </BetaBlock>
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

        <BetaBlock tooltip="Preferences sync coming soon." className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Language / भाषा</label>
            <select
              defaultValue={user?.preferred_language || 'English'}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark theme</p>
              </div>
            </div>
            <input type="checkbox" disabled className="w-5 h-5" />
          </div>
        </BetaBlock>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
          </div>
        </div>

        <BetaBlock tooltip="Notification toggles coming soon." className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">General Notifications</p>
              <p className="text-sm text-gray-500">App updates, health insights</p>
            </div>
            <input type="checkbox" disabled checked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Auto Upload to ABHA</p>
              <p className="text-sm text-gray-500">Automatically sync records</p>
            </div>
            <input type="checkbox" disabled checked className="w-5 h-5" />
          </div>
        </BetaBlock>
      </div>

      {/* Data & Privacy */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Data & Privacy</h2>
          </div>
        </div>

        <div className="space-y-4">
          <BetaFeature tooltip="Data export coming soon.">
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
          </BetaFeature>

          <BetaFeature tooltip="Account deletion securely wipes all data. Coming soon.">
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
          </BetaFeature>
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

          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 text-sm mt-4">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Made with care for better healthcare</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings