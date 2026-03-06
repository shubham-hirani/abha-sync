import React from 'react'
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

import { mockData } from '../mock/mockData'

const ReportExplanation = () => {
  const navigate = useNavigate()
  const [question, setQuestion] = React.useState('')
  const [chatMessages, setChatMessages] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  const handleAskQuestion = () => {
    if (!question.trim()) return
    
    const newMessage = {
      id: Date.now(),
      question: question,
      answer: "Based on your current HbA1c level of 8.5%, I recommend discussing with your doctor about adjusting your diabetes management plan. Consider more frequent blood sugar monitoring and reviewing your diet and exercise routine.",
      timestamp: new Date()
    }
    
    setLoading(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, newMessage])
      setQuestion('')
      setLoading(false)
    }, 2000)
  }

  const explanations = [
    {
      parameter: 'HbA1c',
      data: mockData.explanations.hba1c
    },
    {
      parameter: 'Cholesterol',
      data: mockData.explanations.cholesterol
    }
  ]

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
      <div className="grid md:grid-cols-2 gap-6">
        {explanations.map((item) => {
          const { parameter, data } = item
          const alertColor = data.status === 'high' ? 'red' : data.status === 'moderate' ? 'amber' : 'green'
          
          return (
            <div key={parameter} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${
                  alertColor === 'red' ? 'bg-red-100' :
                  alertColor === 'amber' ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  {alertColor === 'red' ? (
                    <AlertTriangle className={`w-6 h-6 text-red-600`} />
                  ) : alertColor === 'amber' ? (
                    <AlertTriangle className={`w-6 h-6 text-amber-600`} />
                  ) : (
                    <Info className={`w-6 h-6 text-green-600`} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{parameter}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.value}{parameter === 'HbA1c' ? '%' : ' mg/dL'}
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border mb-4 ${
                alertColor === 'red' ? 'bg-red-50 border-red-200' :
                alertColor === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm font-medium mb-2 ${
                  alertColor === 'red' ? 'text-red-800' :
                  alertColor === 'amber' ? 'text-amber-800' : 'text-green-800'
                }`}>
                  {data.status === 'high' ? '⚠️ Above Normal Range' :
                   data.status === 'moderate' ? '⚠️ Needs Attention' : '✅ Within Normal Range'}
                </p>
                <p className={`text-sm ${
                  alertColor === 'red' ? 'text-red-700' :
                  alertColor === 'amber' ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {data.explanation}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Health Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Overall Health Score
            </h3>
            <p className="text-gray-600 mt-1">Based on your lab results and health metrics</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-8 border-amber-200 flex items-center justify-center bg-amber-50">
              <span className="text-2xl font-bold text-amber-700">72</span>
            </div>
            <p className="text-sm text-amber-600 font-medium mt-2">Needs Improvement</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-red-700">Diabetes Control</p>
            <p className="text-xs text-red-600">Needs attention</p>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-amber-700">Heart Health</p>
            <p className="text-xs text-amber-600">Monitor closely</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-green-700">Medication Adherence</p>
            <p className="text-xs text-green-600">Good compliance</p>
          </div>
        </div>
      </div>

      {/* Ask AI Medical Assistant */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
          Ask AI Medical Assistant
        </h3>
        
        <div className="space-y-4">
          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md bg-indigo-500 text-white p-3 rounded-2xl rounded-tr-md">
                      <p className="text-sm">{msg.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md bg-gray-100 p-3 rounded-2xl rounded-tl-md">
                      <p className="text-sm text-gray-800">{msg.answer}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {msg.timestamp.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Input Area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask about your lab results, medications, or health concerns..."
              className="flex-1 px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
              disabled={loading}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!question.trim() || loading}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Suggested Questions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuestion('How can I lower my HbA1c naturally?')}
              className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all duration-300"
            >
              How can I lower my HbA1c naturally?
            </button>
            <button
              onClick={() => setQuestion('What foods should I avoid with high cholesterol?')}
              className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all duration-300"
            >
              What foods should I avoid?
            </button>
            <button
              onClick={() => setQuestion('Are there any side effects of my medications?')}
              className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-all duration-300"
            >
              Medication side effects?
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/timeline')}
          className="btn-secondary flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          View Health Timeline
        </button>
        
        <button
          onClick={() => navigate('/consent')}
          className="btn-primary flex items-center gap-2"
        >
          Continue to Upload
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ReportExplanation