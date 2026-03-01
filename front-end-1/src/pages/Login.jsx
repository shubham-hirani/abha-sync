import React from 'react'
import { Heart, Phone, Shield, ArrowRight } from 'lucide-react'
import api from '../services/api'

const Login = ({ onLogin }) => {
  const [loginMethod, setLoginMethod] = React.useState('mobile') // 'mobile' or 'abha'
  const [mobile, setMobile] = React.useState('')
  const [abhaId, setAbhaId] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [showOtp, setShowOtp] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const handleSendOtp = async () => {
    setError(null)
    if (loginMethod === 'mobile' && mobile.length === 10) {
      setLoading(true)
      try {
        await api.sendOtp({ mobile: `+91${mobile}` })
        setShowOtp(true)
      } catch (err) {
        setError(err.message)
        // Fallback to mock flow
        setTimeout(() => { setShowOtp(true); setError(null) }, 1000)
      } finally {
        setLoading(false)
      }
    } else if (loginMethod === 'abha' && abhaId.length >= 10) {
      setLoading(true)
      try {
        await api.sendOtp({ abhaId })
        setShowOtp(true)
      } catch (err) {
        setError(err.message)
        // Fallback
        setTimeout(() => { onLogin(); setError(null) }, 1500)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setLoading(true)
      setError(null)
      try {
        const identifier = loginMethod === 'mobile' ? { mobile: `+91${mobile}` } : { abhaId }
        await api.verifyOtp({ ...identifier, otp })
        onLogin()
      } catch (err) {
        setError(err.message)
        // Fallback to mock
        setTimeout(() => { onLogin(); setError(null) }, 1000)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ABHA-Sync</h1>
              <p className="text-gray-600">Healthcare Dashboard</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to access your health records</p>
        </div>

        {/* Login Card */}
        <div className="glass border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Login Method Toggle */}
          <div className="flex bg-gray-100/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setLoginMethod('mobile')
                setShowOtp(false)
                setOtp('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                loginMethod === 'mobile'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Mobile OTP
            </button>
            <button
              onClick={() => {
                setLoginMethod('abha')
                setShowOtp(false)
                setOtp('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                loginMethod === 'abha'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              ABHA ID
            </button>
          </div>

          {/* Mobile Login */}
          {loginMethod === 'mobile' && (
            <div className="space-y-4">
              {!showOtp ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter mobile number"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSendOtp}
                    disabled={mobile.length !== 10 || loading}
                    className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                      loading ? 'cursor-wait' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Send OTP
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      We've sent a 6-digit code to +91 {mobile}
                    </p>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-center text-lg font-mono tracking-widest"
                    />
                  </div>
                  
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || loading}
                    className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                      loading ? 'cursor-wait' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Verify &amp; Continue
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowOtp(false)
                      setOtp('')
                    }}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Change mobile number
                  </button>
                </>
              )}
            </div>
          )}

          {/* ABHA Login */}
          {loginMethod === 'abha' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ABHA ID
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="Enter your ABHA ID"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                />
              </div>
              
              <button
                onClick={handleSendOtp}
                disabled={abhaId.length < 10 || loading}
                className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  loading ? 'cursor-wait' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Verify ABHA ID
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <p className="text-center text-sm text-gray-500 mb-3">For Demo:</p>
            <button
              onClick={onLogin}
              className="w-full btn-secondary"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login