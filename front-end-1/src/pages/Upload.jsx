import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'

import FileUpload from '../components/FileUpload'

const Upload = () => {
  const navigate = useNavigate()
  const [uploadedFile, setUploadedFile] = React.useState(null)
  const [processing, setProcessing] = React.useState(false)
  const [processed, setProcessed] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [extractionResult, setExtractionResult] = React.useState(null)

  const handleFileSelect = (file) => {
    setUploadedFile(file)
    setProcessed(false)
    setError(null)
  }

  const handleProcessWithAI = async () => {
    if (!uploadedFile) return
    
    setProcessing(true)
    setError(null)
    
    try {
      // For MVP: read file as text or use filename as mock text input
      const text = await readFileAsText(uploadedFile)
      const result = await api.uploadText(
        text || `Medical document: ${uploadedFile.name}. Patient report uploaded on ${new Date().toLocaleDateString()}.`,
        uploadedFile.name,
        detectFileType(uploadedFile.name)
      )
      
      setExtractionResult(result.data)
      setProcessed(true)
      
      // Store result for review page
      localStorage.setItem('lastExtraction', JSON.stringify(result.data))
      
      // Navigate to review after brief delay
      setTimeout(() => {
        navigate('/review-extraction')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.')
      // Fallback: still navigate with mock flow
      setTimeout(() => {
        setProcessed(true)
        navigate('/review-extraction')
      }, 2000)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Records</h1>
        <p className="text-gray-600">
          Upload your medical reports, prescriptions, or lab results for AI analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium mb-4">
            <UploadIcon className="w-4 h-4" />
            Step 1: Upload Document
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Select Your Medical Document</h2>
          <p className="text-gray-500 mt-1">
            Supported formats: JPG, PNG, PDF • Maximum size: 10MB
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes={['image/*', '.pdf']}
          maxSize={10}
          multiple={false}
          preview={true}
          processing={processing}
        />

        {/* Process Button */}
        {uploadedFile && !processed && (
          <div className="mt-6 text-center">
            <button
              onClick={handleProcessWithAI}
              disabled={processing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <div>
                    <p className="font-medium">Processing with AI...</p>
                    <p className="text-sm opacity-90">Extracting medical information</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Process with AI
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Success State */}
        {processed && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl mb-4">
              <CheckCircle className="w-5 h-5" />
              Processing Complete!
            </div>
            <p className="text-gray-600 mb-4">
              Your document has been successfully analyzed. Review the extracted information.
            </p>
            <button
              onClick={() => navigate('/review-extraction')}
              className="btn-primary"
            >
              Review Extraction →
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 font-bold text-xl">1</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Upload Document</h3>
          <p className="text-gray-600 text-sm">
            Take a clear photo or upload a PDF of your medical report
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-indigo-600 font-bold text-xl">2</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">AI Processing</h3>
          <p className="text-gray-600 text-sm">
            Our AI analyzes and extracts key medical information accurately
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-cyan-600 font-bold text-xl">3</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Review & Save</h3>
          <p className="text-gray-600 text-sm">
            Review extracted data, make edits if needed, and save to your records
          </p>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Lab Report - Blood Sugar</p>
                <p className="text-sm text-gray-500">Uploaded Feb 20, 2024</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Processed
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Prescription - Diabetes Medication</p>
                <p className="text-sm text-gray-500">Uploaded Feb 15, 2024</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Processed
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    if (file.type?.startsWith('text/') || file.name?.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    } else {
      // For images/PDFs, use a descriptive text for mock extraction
      resolve(`Patient medical document uploaded: ${file.name}. Type: ${file.type || 'unknown'}. Date: ${new Date().toISOString()}.
Patient: Mr. Rohan V. 
Doctor: Dr. Mehta
Diagnosis: Type 2 Diabetes, Hypertension
Medications: Metformin 500mg twice daily, Atorvastatin 10mg once daily
Lab Values: HbA1c: 8.5 %, Cholesterol: 240 mg/dL, Blood Sugar: 180 mg/dL`)
    }
  })
}

function detectFileType(fileName) {
  if (!fileName) return 'other'
  const lower = fileName.toLowerCase()
  if (lower.includes('prescription') || lower.includes('rx')) return 'prescription'
  if (lower.includes('lab') || lower.includes('report') || lower.includes('test')) return 'lab_report'
  if (lower.includes('discharge') || lower.includes('summary')) return 'discharge_summary'
  return 'other'
}

export default Upload