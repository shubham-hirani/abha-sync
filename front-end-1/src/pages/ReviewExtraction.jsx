import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Stethoscope,
  Activity,
  Pill,
  TestTube,
  Check,
  ArrowRight,
  FileText,
  AlertCircle,
  ShieldAlert,
  HeartHandshake,
  RefreshCw,
  Calendar,
  Upload
} from 'lucide-react'

import { recordsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ReviewExtraction = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  const fetchRecord = async () => {
    const recordId = sessionStorage.getItem('current_record_id')
    if (!recordId) {
      navigate('/dashboard')
      return
    }
    try {
      const data = await recordsApi.get(recordId)
      setRecord(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch record details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecord()
  }, [navigate])

  const handleRetryAnalysis = async () => {
    if (!record) return
    setRetrying(true)
    try {
      const analyzed = await recordsApi.analyze(record.id)
      setRecord(analyzed)
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please try again.')
    } finally {
      setRetrying(false)
    }
  }

  const handleConfirm = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl max-w-4xl mx-auto">
        {error}
      </div>
    )
  }

  if (!record) return null

  // Safely parse ai_analysis (stored as JSON string in DB)
  let ai = {}
  if (record.ai_analysis) {
    try {
      ai = typeof record.ai_analysis === 'string'
        ? JSON.parse(record.ai_analysis)
        : record.ai_analysis
    } catch (_) {
      ai = {}
    }
  }

  // Parse arrays safely
  const medications = Array.isArray(ai.medications) ? ai.medications : []
  const labValues = Array.isArray(ai.lab_results) ? ai.lab_results : []
  const drugs = Array.isArray(ai.drugs) ? ai.drugs : []
  const precautions = Array.isArray(ai.general_precautions) ? ai.general_precautions : []

  const uploadedDate = record.uploaded_at
    ? new Date(record.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

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
          Verify the information extracted from your medical document.
        </p>
      </div>

      {/* File Info */}
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">Source Document</h2>
            <p className="text-gray-500">{record.file_name}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {ai.analysis_type && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full capitalize">
                  Type: {ai.analysis_type}
                </span>
              )}
              {uploadedDate && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  <Upload className="w-3 h-3" />
                  Uploaded: {uploadedDate}
                </span>
              )}
              {ai.date && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Calendar className="w-3 h-3" />
                  Report Date: {ai.date}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis pending / failed state with Retry */}
      {!record.ai_analysis ? (
        <div className="p-6 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2 text-lg">Analysis Pending or Unavailable</h3>
          <p className="text-sm mb-4">
            This record has not been analyzed by AI yet, or the analysis failed.
            Click below to retry.
          </p>
          <button
            onClick={handleRetryAnalysis}
            disabled={retrying}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry AI Analysis
              </>
            )}
          </button>
        </div>
      ) : (
        <>
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
                <p className="text-lg font-semibold text-gray-800">
                  {ai.patient_name || (user?.email ? user.email.split('@')[0] : 'Unknown')}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Report Date</label>
                <p className="text-lg font-semibold text-gray-800">{ai.date || '—'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Uploaded On</label>
                <p className="text-lg font-semibold text-gray-800">{uploadedDate || '—'}</p>
              </div>
              {ai.analysis_type && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Document Type</label>
                  <p className="text-lg font-semibold text-gray-800 capitalize">{ai.analysis_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Info */}
          {(ai.doctor_name || ai.hospital_name) && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Doctor & Hospital</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                  <p className="text-lg font-semibold text-gray-800">{ai.doctor_name || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Hospital</label>
                  <p className="text-lg font-semibold text-gray-800">{ai.hospital_name || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {ai.summary && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Analysis Summary</h2>
                </div>
              </div>
              <p className="text-gray-800 leading-relaxed text-md">{ai.summary}</p>
            </div>
          )}

          {/* Drugs (Detailed Schema) */}
          {drugs.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Prescribed Drugs & Supplements</h2>
                  <p className="text-gray-500">Detailed medication information</p>
                </div>
              </div>

              <div className="space-y-6">
                {drugs.map((drug, index) => (
                  <div key={index} className="p-5 bg-gray-50/50 rounded-xl border border-gray-200/50 space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="text-lg font-bold text-gray-800">{drug.name}</h3>
                      {drug.what_it_is && <p className="text-gray-600 mt-1">{drug.what_it_is}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {drug.dosage && <div><span className="font-semibold text-gray-700">Dosage:</span> <span className="text-gray-600">{drug.dosage}</span></div>}
                      {drug.frequency && <div><span className="font-semibold text-gray-700">Frequency:</span> <span className="text-gray-600">{drug.frequency}</span></div>}
                      {drug.duration && <div><span className="font-semibold text-gray-700">Duration:</span> <span className="text-gray-600">{drug.duration}</span></div>}
                      {drug.when_to_take && <div><span className="font-semibold text-gray-700">When to take:</span> <span className="text-gray-600">{drug.when_to_take}</span></div>}
                    </div>

                    {drug.instructions && (
                      <div className="text-sm bg-blue-50 p-3 rounded-lg text-blue-800">
                        <span className="font-semibold">Instructions:</span> {drug.instructions}
                      </div>
                    )}

                    {drug.food_interactions && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Food Interactions:</span> <span className="text-gray-600">{drug.food_interactions}</span>
                      </div>
                    )}

                    {(drug.side_effects?.length > 0 || drug.warnings?.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4 mt-2">
                        {drug.side_effects?.length > 0 && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <h4 className="font-semibold text-amber-800 mb-1 text-sm">Side Effects</h4>
                            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                              {drug.side_effects.map((se, i) => <li key={i}>{se}</li>)}
                            </ul>
                          </div>
                        )}
                        {drug.warnings?.length > 0 && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <h4 className="font-semibold text-red-800 mb-1 text-sm">Warnings</h4>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                              {drug.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Medications (backwards compat) */}
          {medications.length > 0 && drugs.length === 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Prescribed Medications</h2>
                </div>
              </div>
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                    <p className="font-semibold text-gray-800">{med.name} {med.dosage}</p>
                    <p className="text-sm text-gray-600">{med.frequency} {med.duration && `• ${med.duration}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Values */}
          {labValues.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <TestTube className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Lab Values</h2>
                </div>
              </div>
              <div className="space-y-4">
                {labValues.map((lab, index) => (
                  <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{lab.test_name}</p>
                        <p className="text-sm text-gray-600">Range: {lab.reference_range}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{lab.value} {lab.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Precautions */}
          {precautions.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">General Precautions</h2>
                </div>
              </div>
              <ul className="space-y-4">
                {precautions.map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-3 bg-teal-50/50 rounded-lg">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800">{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to see doctor */}
          {ai.when_to_see_doctor && (
            <div className={`card border ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <AlertCircle className={`w-6 h-6 ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'text-red-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'text-red-800' : 'text-amber-800'}`}>
                    When to See a Doctor
                  </h2>
                  <p className={`text-sm font-medium capitalize ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'text-red-600' : 'text-amber-600'}`}>
                    Urgency: {ai.when_to_see_doctor.urgency}
                  </p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${['immediate', 'urgent'].includes(ai.when_to_see_doctor.urgency?.toLowerCase()) ? 'text-red-900' : 'text-amber-900'}`}>
                {ai.when_to_see_doctor.reason}
              </p>
            </div>
          )}

          {/* Reassurance */}
          {ai.reassurance && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <HeartHandshake className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-blue-900">Reassurance</h2>
              </div>
              <p className="text-blue-800 leading-relaxed text-sm">{ai.reassurance}</p>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <button onClick={handleConfirm} className="btn-primary flex items-center gap-2">
          Finish Review
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ReviewExtraction