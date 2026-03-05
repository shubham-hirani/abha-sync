import Layout from '../components/Layout'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

export default function SafeSummary() {
  const [results] = useState({ glucose: 320, hemoglobin: 10.2, creatinine: 1.0 })
  const lifeThreatening = results.glucose > 300 || results.creatinine > 5

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Safe Summary</h1>
          <p className="text-gray-600">Personalized lab results explanation & safety alerts</p>
        </div>

        {/* Safety Triage Alert */}
        <div className={`med-card p-6 border-l-4 ${lifeThreatening ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-50/50' : 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50/50'}`}>
          <div className="flex items-start gap-4">
            {lifeThreatening ? (
              <AlertTriangle size={32} className="text-red-600 flex-shrink-0" />
            ) : (
              <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-1 ${lifeThreatening ? 'text-red-700' : 'text-green-700'}`}>
                {lifeThreatening ? '⚠️ Safety Alert: Consult Doctor' : '✓ All Clear: Stable'}
              </h2>
              <p className={`text-sm ${lifeThreatening ? 'text-red-600' : 'text-green-600'}`}>
                {lifeThreatening 
                  ? 'One or more values indicate potential health risks. Please consult with your healthcare provider immediately.'
                  : 'Your lab results are within safe ranges.'}
              </p>
            </div>
          </div>
        </div>

        {/* Lab Results Explanation */}
        <div className="med-card p-6">
          <h3 className="text-2xl font-bold text-primary mb-6">Your Lab Results</h3>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Glucose: {results.glucose} mg/dL</div>
                  <p className="text-sm text-gray-700 mt-1">⚠️ <strong>High:</strong> Values above 300 mg/dL can cause symptoms like excessive thirst, fatigue, and blurred vision.</p>
                  <p className="text-xs text-gray-600 mt-2">Recommendation: Monitor closely, increase water intake, and schedule an urgent doctor appointment.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-l-4 border-orange-400 bg-orange-50 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Hemoglobin: {results.hemoglobin} g/dL</div>
                  <p className="text-sm text-gray-700 mt-1">🔶 <strong>Slightly Low:</strong> May indicate mild anemia, which can cause fatigue and weakness.</p>
                  <p className="text-xs text-gray-600 mt-2">Recommendation: Increase iron-rich foods (spinach, red meat), take iron supplements if prescribed, and retest in 4-6 weeks.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-l-4 border-green-400 bg-green-50 rounded">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Creatinine: {results.creatinine} mg/dL</div>
                  <p className="text-sm text-gray-700 mt-1">✓ <strong>Normal:</strong> Kidney function is within expected range.</p>
                  <p className="text-xs text-gray-600 mt-2">No action needed. Continue with regular health checks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="med-card p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="text-xl font-bold text-primary mb-4">📋 Action Plan</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-gray-700"><strong>Urgent:</strong> Contact your doctor within 24 hours for high glucose levels</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-gray-700"><strong>This week:</strong> Consult about anemia management and iron supplementation</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-gray-700"><strong>Daily:</strong> Monitor blood glucose, keep emergency doctor contacts handy</span>
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  )
}
