import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Info,
  MessageCircle,
  Send,
  ArrowRight,
  TrendingUp,
  Target,
  Heart
} from 'lucide-react'

import { recordsApi } from '../services/api'
import { BetaFeature, BetaBanner } from '../components/BetaFeature'

const ReportExplanation = () => {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const recordId = sessionStorage.getItem('current_record_id')
    if (!recordId) {
      navigate('/dashboard')
      return
    }

    const fetchRecord = async () => {
      try {
        const data = await recordsApi.get(recordId)
        setRecord(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch report details')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !record || !record.ai_analysis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-8 text-center text-amber-800 bg-amber-50">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Analysis Not Available</h2>
          <p>We could not load the AI explanation for this record.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-4">
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const ai = record.ai_analysis
  const labValues = Array.isArray(ai.lab_results) ? ai.lab_results : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Explanation</h1>
        <p className="text-gray-600">
          Understand your lab results with AI-powered explanations
        </p>
      </div>

      {/* Lab Results Overview */}
      {labValues.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {labValues.map((item, idx) => {
            // Very fuzzy mock logic to assign colors based on some heuristic
            // In reality, backend AI would provide the "status/severity"
            let alertColor = 'green'
            let statusText = 'Within Normal Range'

            if (item.value && item.reference_range) {
              const val = parseFloat(item.value)
              if (!isNaN(val) && item.reference_range.includes('-')) {
                const [min, max] = item.reference_range.split('-').map(str => parseFloat(str))
                if (val > max) { alertColor = 'red'; statusText = 'Above Normal Range' }
                else if (val < min) { alertColor = 'amber'; statusText = 'Below Normal Range' }
              }
            }

            return (
              <div key={idx} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${alertColor === 'red' ? 'bg-red-100' :
                      alertColor === 'amber' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                    {alertColor === 'red' || alertColor === 'amber' ? (
                      <AlertTriangle className={`w-6 h-6 text-${alertColor}-600`} />
                    ) : (
                      <Info className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{item.test_name}</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.value} {item.unit}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border mb-4 ${alertColor === 'red' ? 'bg-red-50 border-red-200' :
                    alertColor === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                  }`}>
                  <p className={`text-sm font-medium mb-2 ${alertColor === 'red' ? 'text-red-800' :
                      alertColor === 'amber' ? 'text-amber-800' : 'text-green-800'
                    }`}>
                    {statusText}
                  </p>
                  <p className="text-sm text-gray-700">
                    Range: {item.reference_range}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Health Score Card — generic mock based on data */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-indigo-500" />
              AI Summary Snapshot
            </h3>
            <p className="text-gray-600 mt-1">Based on your extracted records</p>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm font-medium text-indigo-900 leading-relaxed">
            {ai.summary || "Summary not available."}
          </p>
        </div>
      </div>

      {/* Ask AI Medical Assistant */}
      <div className="card relative">
        <BetaBanner featureName="AI Medical Chatbot" />

        <div className="opacity-50 pointer-events-none select-none mt-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            Ask AI Medical Assistant
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={() => { }}
                placeholder="Ask about your lab results..."
                className="flex-1 px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl"
                disabled
              />
              <button disabled className="btn-primary px-4">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={() => navigate('/timeline')} className="btn-secondary flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          View Health Timeline
        </button>
        <button onClick={() => navigate('/consent')} className="btn-primary flex items-center gap-2">
          Manage Privacy
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ReportExplanation