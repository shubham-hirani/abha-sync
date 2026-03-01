import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Stethoscope, 
  Activity, 
  Pill, 
  TestTube, 
  Edit3, 
  Check, 
  ArrowRight 
} from 'lucide-react'

import { mockData } from '../mock/mockData'

const ReviewExtraction = () => {
  const navigate = useNavigate()
  const [editingField, setEditingField] = React.useState(null)

  // Try to load real extraction result from API, fallback to mock
  const storedExtraction = React.useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lastExtraction') || '{}')
      if (stored.extraction) return stored
      return null
    } catch { return null }
  }, [])

  const [extractedData, setExtractedData] = React.useState(() => {
    if (storedExtraction?.extraction) {
      const ext = storedExtraction.extraction
      return {
        patient: ext.patient?.name || mockData.user.name,
        doctor: ext.doctor?.name || "Dr. Mehta",
        hospital: "Apollo Hospital",
        date: ext.extractedAt?.split('T')[0] || "2024-02-20",
        diagnosis: Array.isArray(ext.diagnosis) ? ext.diagnosis[0] : ext.diagnosis || "Type 2 Diabetes",
        confidenceScore: ext.confidenceScore || 0,
        medications: (ext.medicines || []).length > 0 
          ? ext.medicines.map((m, i) => ({ id: i + 1, name: m.name, dosage: m.dosage, frequency: m.frequency }))
          : mockData.medications.slice(0, 2),
        labValues: (ext.labValues || []).length > 0
          ? ext.labValues.map((l, i) => ({ id: i + 1, parameter: l.parameter, value: l.value, unit: l.unit }))
          : mockData.labResults.slice(0, 2),
        normalization: storedExtraction.normalization || null,
      }
    }
    return {
      patient: mockData.user.name,
      doctor: "Dr. Mehta",
      hospital: "Apollo Hospital",
      date: "2024-02-20",
      diagnosis: "Type 2 Diabetes",
      confidenceScore: 0,
      medications: mockData.medications.slice(0, 2),
      labValues: mockData.labResults.slice(0, 2),
      normalization: null,
    }
  })

  const handleEdit = (field, value) => {
    setExtractedData(prev => ({ ...prev, [field]: value }))
    setEditingField(null)
  }

  const handleConfirm = () => {
    navigate('/cost-savings')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium mb-4">
          <Check className="w-4 h-4" />
          Step 2: Review Extracted Information
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Review Extracted Data</h1>
        <p className="text-gray-600">
          Verify the information extracted from your medical document. Click on any field to edit.
        </p>
      </div>

      {/* Patient Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
            <p className="text-gray-500">Basic patient details</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Patient Name</label>
            <div className="flex items-center gap-2">
              {editingField === 'patient' ? (
                <input
                  type="text"
                  value={extractedData.patient}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, patient: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">{extractedData.patient}</p>
                  <button
                    onClick={() => setEditingField('patient')}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Date</label>
            <div className="flex items-center gap-2">
              {editingField === 'date' ? (
                <input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, date: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(extractedData.date).toLocaleDateString('en-IN')}
                  </p>
                  <button
                    onClick={() => setEditingField('date')}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Doctor & Hospital</h2>
            <p className="text-gray-500">Healthcare provider details</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Doctor Name</label>
            <div className="flex items-center gap-2">
              {editingField === 'doctor' ? (
                <input
                  type="text"
                  value={extractedData.doctor}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, doctor: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">{extractedData.doctor}</p>
                  <button
                    onClick={() => setEditingField('doctor')}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Hospital</label>
            <div className="flex items-center gap-2">
              {editingField === 'hospital' ? (
                <input
                  type="text"
                  value={extractedData.hospital}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, hospital: e.target.value }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">{extractedData.hospital}</p>
                  <button
                    onClick={() => setEditingField('hospital')}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Diagnosis</h2>
            <p className="text-gray-500">Medical condition identified</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editingField === 'diagnosis' ? (
            <input
              type="text"
              value={extractedData.diagnosis}
              onChange={(e) => setExtractedData(prev => ({ ...prev, diagnosis: e.target.value }))}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <>
              <p className="text-xl font-bold text-gray-800">{extractedData.diagnosis}</p>
              <button
                onClick={() => setEditingField('diagnosis')}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Medications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Pill className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Prescribed Medications</h2>
            <p className="text-gray-500">Medicines and dosage information</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {extractedData.medications.map((med, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{med.name} {med.dosage}</p>
                  <p className="text-sm text-gray-600">{med.frequency}</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Values */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-100 rounded-xl">
            <TestTube className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Lab Values</h2>
            <p className="text-gray-500">Test results and measurements</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {extractedData.labValues.map((lab, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{lab.parameter}</p>
                      <p className="text-sm text-gray-600">Normal range: {lab.normalRange}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        lab.status === 'High' ? 'text-red-600' : 
                        lab.status === 'Low' ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {lab.value}{lab.unit}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lab.status === 'High' ? 'bg-red-100 text-red-700' :
                        lab.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {lab.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors ml-4">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/upload')}
          className="btn-secondary"
        >
          Edit Document
        </button>
        
        <button
          onClick={handleConfirm}
          className="btn-primary flex items-center gap-2"
        >
          Confirm & Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ReviewExtraction