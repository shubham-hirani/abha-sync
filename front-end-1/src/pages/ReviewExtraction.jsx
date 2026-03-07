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
  FileText
} from 'lucide-react'

import { recordsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ReviewExtraction = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

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
        setError(err.message || 'Failed to fetch record details')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [navigate])

  const handleConfirm = () => {
    // If we wanted to save extracted data, we'd do it here. 
    // Currently, it's already saved by the backend analysis endpoint.
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

  // Safely grab ai_analysis
  const ai = record.ai_analysis || {}

  // Parse arrays safely
  const medications = Array.isArray(ai.medications) ? ai.medications : []
  const labValues = Array.isArray(ai.lab_results) ? ai.lab_results : []

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
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Source Document</h2>
            <p className="text-gray-500">{record.file_name}</p>
          </div>
        </div>
      </div>

      {!record.ai_analysis ? (
        <div className="p-6 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-center">
          <h3 className="font-semibold mb-2">Analysis Pending or Unavailable</h3>
          <p className="text-sm">
            This record has not been analyzed by AI yet, or the analysis failed.
          </p>
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
                <label className="text-sm font-medium text-gray-600">Patient Details</label>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.email ? user.email.split('@')[0] : 'Unknown'}
                  {ai.patient_name && ` (extracted: ${ai.patient_name})`}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-lg font-semibold text-gray-800">
                  {ai.date || new Date(record.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Info */}
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

          {/* Additional Notes / Summary */}
          {ai.summary && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Diagnosis / Summary</h2>
                </div>
              </div>
              <p className="text-lg text-gray-800 leading-relaxed">{ai.summary}</p>
            </div>
          )}

          {/* Medications */}
          {medications.length > 0 && (
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
                        <p className="text-lg font-bold text-gray-800">
                          {lab.value} {lab.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <button
          onClick={handleConfirm}
          className="btn-primary flex items-center gap-2"
        >
          Finish Review
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ReviewExtraction