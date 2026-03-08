import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  FileText,
  Stethoscope,
  TestTube,
  Pill,
  Eye,
  Download,
  Share2,
  Upload
} from 'lucide-react'

import { useRecords } from '../context/RecordsContext'
import { recordsApi } from '../services/api'
import { BetaFeature } from '../components/BetaFeature'

const Timeline = () => {
  const navigate = useNavigate()
  const { records, loading, error, fetchRecords } = useRecords()
  const [selectedFilter, setSelectedFilter] = React.useState('all')

  React.useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Create timeline items from real records
  const timelineData = useMemo(() => {
    return records.map(record => {
      // Try to extract better data from AI analysis if available
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

      const condition = ai.summary?.split('.')[0] || record.file_name.replace(/\.[^/.]+$/, "")
      const summary = ai.summary || record.notes || 'No summary available.'
      const patientName = ai.patient_name || null
      const reportDate = ai.date || null

      return {
        id: record.id,
        condition: condition.length > 50 ? condition.substring(0, 50) + '...' : condition,
        status: record.ai_analysis ? 'Reviewed' : 'Pending',
        uploadedDate: record.uploaded_at || new Date().toISOString(),
        reportDate,
        type: record.record_type,
        doctor: ai.doctor_name || 'ABHA-Sync Provider',
        hospital: ai.hospital_name || 'Uploaded Record',
        patientName,
        summary,
        rawRecord: record
      }
    }).sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate))
  }, [records])

  // Compute filter counts
  const filters = useMemo(() => {
    const counts = { all: timelineData.length }
    timelineData.forEach(item => {
      const type = item.type || 'record'
      counts[type] = (counts[type] || 0) + 1
    })

    const baseFilters = [
      { id: 'all', label: 'All Records', count: counts.all }
    ]

    Object.keys(counts).forEach(key => {
      if (key !== 'all') {
        baseFilters.push({
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
          count: counts[key]
        })
      }
    })

    return baseFilters
  }, [timelineData])

  const getIconForType = (type) => {
    switch (type) {
      case 'lab':
      case 'lab_report': return TestTube
      case 'prescription': return Pill
      case 'consultation': return Stethoscope
      default: return FileText
    }
  }

  const getColorForStatus = (status) => {
    switch (status) {
      case 'Reviewed': return 'bg-green-100 text-green-700 border-green-200'
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleDownload = (recordId, fileName) => {
    const url = recordsApi.fileUrl(recordId)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'medical-record'
    a.target = '_blank'
    a.click()
  }

  const filteredTimeline = timelineData.filter(item => {
    if (selectedFilter === 'all') return true
    return item.type === selectedFilter
  })

  // ─── Loading / Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl">
        Failed to load timeline: {error}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Health Timeline</h1>
          <p className="text-gray-600 mt-1">
            Complete chronological view of your medical records and health journey
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BetaFeature tooltip="Export functionality is coming soon">
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </BetaFeature>
          <BetaFeature tooltip="Sharing functionality is coming soon">
            <button className="btn-secondary flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </BetaFeature>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Record Type</label>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${selectedFilter === filter.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {filter.label}
              <span className={`ml-2 text-xs ${selectedFilter === filter.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                ({filter.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-500 to-indigo-500 opacity-30"></div>

        <div className="space-y-6">
          {filteredTimeline.map((item) => {
            const Icon = getIconForType(item.type)

            return (
              <div key={item.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-6 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full shadow-lg z-10 -translate-x-1/2"></div>

                {/* Timeline Card */}
                <div className="ml-16 card hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.condition}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorForStatus(item.status)}`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Dual Dates */}
                        <div className="space-y-1 text-sm text-gray-600">
                          {item.reportDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-blue-700">Report Date:</span>
                              <span>{item.reportDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-600">Uploaded:</span>
                            <span>
                              {new Date(item.uploadedDate).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="capitalize text-gray-500">· {item.type?.replace('_', ' ')}</span>
                          </div>
                          {item.patientName && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600">Patient:</span>
                              <span>{item.patientName}</span>
                            </div>
                          )}
                          {item.doctor && item.doctor !== 'ABHA-Sync Provider' && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600">Doctor:</span>
                              <span>{item.doctor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_record_id', item.id)
                        navigate('/review-extraction')
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                    <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                    <p className="text-sm text-gray-700">{item.summary}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/50">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('current_record_id', item.id)
                        navigate('/review-extraction')
                      }}
                      className="px-3 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-300">
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownload(item.id, item.rawRecord.file_name)}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTimeline.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No records found</h3>
          <p className="text-gray-600 mb-6">
            No medical records match your current filter selection.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setSelectedFilter('all')} className="btn-secondary">
              Clear Filters
            </button>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload New Record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline