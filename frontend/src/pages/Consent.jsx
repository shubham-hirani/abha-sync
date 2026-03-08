import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Check,
  Lock,
  Upload,
  FileText,
  Users,
  ArrowRight
} from 'lucide-react'

import { BetaFeature } from '../components/BetaFeature'

const Consent = () => {
  const navigate = useNavigate()
  const [consents, setConsents] = React.useState({
    uploadToABHA: true,
    shareWithDoctors: false,
    anonymousResearch: false,
    marketingCommunication: false
  })

  const handleConsentChange = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const consentItems = [
    {
      key: 'uploadToABHA',
      title: 'Upload to ABHA (Ayushman Bharat Health Account)',
      description: 'Store your medical records securely in your ABHA account for easy access by healthcare providers.',
      icon: Shield,
      required: true
    },
    {
      key: 'shareWithDoctors',
      title: 'Share with Healthcare Providers',
      description: 'Allow authorized doctors and hospitals to access your medical history for better treatment.',
      icon: Users,
      required: false
    },
    {
      key: 'anonymousResearch',
      title: 'Anonymous Medical Research',
      description: 'Contribute anonymized data to medical research for improving healthcare outcomes.',
      icon: FileText,
      required: false
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy & Consent</h1>
        <p className="text-gray-600">
          Choose how you want to share and use your health data
        </p>
      </div>

      {/* Consent Options */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Sharing Preferences</h2>

        <div className="space-y-4">
          {consentItems.map((item) => {
            const Icon = item.icon
            const isChecked = consents[item.key]

            return (
              <div key={item.key} className="border border-gray-200/50 rounded-xl p-4 hover:border-gray-300 transition-all duration-300">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 border-2 rounded transition-all duration-300 flex items-center justify-center ${isChecked
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300 hover:border-indigo-400'
                      }`}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleConsentChange(item.key)}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </label>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Your Data is Secure</h3>
          </div>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              End-to-end encryption for all data
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              HIPAA compliant data handling
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">ABHA Benefits</h3>
          </div>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              Access records from any hospital
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              Emergency medical information
            </li>
          </ul>
        </div>
      </div>

      {/* Upload Button */}
      <div className="text-center space-y-4">
        <BetaFeature tooltip="ABHA Network Upload API is coming soon">
          <button
            disabled
            className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload to ABHA
            </div>
          </button>
        </BetaFeature>

        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Currently running in standalone mode (no ABHA integration yet).
        </p>
      </div>

      {/* Alternative Actions */}
      <div className="flex gap-4 justify-center pt-6 border-t border-gray-200/50">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Continue to Dashboard
        </button>
      </div>
    </div>
  )
}

export default Consent