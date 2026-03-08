import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, ArrowRight, CheckCircle, FileText, Clock } from 'lucide-react'

import FileUpload from '../components/FileUpload'
import { recordsApi } from '../services/api'
import { useRecords } from '../context/RecordsContext'

const Upload = () => {
  const navigate = useNavigate()
  const { records, addRecord, updateRecord } = useRecords()

  const [uploadedFile, setUploadedFile] = React.useState(null)
  const [recordType, setRecordType] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [uploadedRecord, setUploadedRecord] = React.useState(null)
  const [error, setError] = React.useState('')

  const handleFileSelect = (fileObj) => {
    setUploadedFile(fileObj ? fileObj.file : null)
    setUploadedRecord(null)
    setError('')
  }

  const handleProcessWithAI = async () => {
    if (!uploadedFile) return
    setError('')
    setUploading(true)

    try {
      // Step 1: Upload the file
      const record = await recordsApi.upload(uploadedFile, recordType, notes)
      addRecord(record)
      setUploadedRecord(record)
      setUploading(false)

      // Step 2: Analyze with AI
      setAnalyzing(true)
      try {
        const analyzed = await recordsApi.analyze(record.id)
        updateRecord(analyzed)
        setUploadedRecord(analyzed)

        // Store record id so ReviewExtraction can look it up
        sessionStorage.setItem('current_record_id', analyzed.id)
      } catch (analyzeErr) {
        // Analysis failed — still proceed with the uploaded record
        sessionStorage.setItem('current_record_id', record.id)
      } finally {
        setAnalyzing(false)
      }

      // Navigate to review after brief pause
      setTimeout(() => navigate('/review-extraction'), 1500)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const processing = uploading || analyzing

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
            Supported formats: JPG, PNG, PDF • Maximum size: 10 MB
          </p>
        </div>

        {/* Record type selector */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70"
            >
              <option value="">Select Record Type</option>
              <option value="lab_report">Lab Report</option>
              <option value="report">Prescription</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Blood sugar test — Feb 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70"
            />
          </div>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes={['image/*', '.pdf']}
          maxSize={10}
          multiple={false}
          preview={true}
          processing={processing}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Process Button */}
        {uploadedFile && !uploadedRecord && (
          <div className="mt-6 text-center">
            <button
              onClick={handleProcessWithAI}
              disabled={processing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <div>
                    <p className="font-medium">Uploading…</p>
                    <p className="text-sm opacity-90">Storing your record securely</p>
                  </div>
                </div>
              ) : analyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <div>
                    <p className="font-medium">Analyzing with AI…</p>
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
        {uploadedRecord && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl mb-4">
              <CheckCircle className="w-5 h-5" />
              Upload Complete!
            </div>
            <p className="text-gray-600 mb-4">
              Your document has been sent for analysis. You can review the progress.
            </p>
            <button
              onClick={() => navigate('/review-extraction')}
              className="btn-primary"
            >
              Review Record →
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { n: 1, color: 'blue', title: 'Upload Document', desc: 'Take a clear photo or upload a PDF of your medical report' },
          { n: 2, color: 'indigo', title: 'AI Processing', desc: 'Our AI analyzes and extracts key medical information accurately' },
          { n: 3, color: 'cyan', title: 'Review & Save', desc: 'Review extracted data, make edits if needed, and save to your records' },
        ].map(({ n, color, title, desc }) => (
          <div key={n} className="card text-center">
            <div className={`w-12 h-12 bg-${color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-${color}-600 font-bold text-xl`}>{n}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Uploads — pulled from real records */}
      {records.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h3>
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  sessionStorage.setItem('current_record_id', record.id)
                  navigate('/review-extraction')
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-64">{record.file_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.uploaded_at
                        ? new Date(record.uploaded_at).toLocaleDateString('en-IN')
                        : 'Recently uploaded'}
                      {' • '}
                      <span className="capitalize">{record.record_type}</span>
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.ai_status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : record.ai_status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                  {record.ai_status === 'completed' ? 'Analyzed' : record.ai_status === 'failed' ? 'Failed' : 'Analyzing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload