import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Filter, 
  FileText, 
  Stethoscope, 
  TestTube, 
  Pill,
  Eye,
  Download,
  Share2
} from 'lucide-react'

import { mockData } from '../mock/mockData'

const Timeline = () => {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = React.useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('6months')
  
  const filters = [
    { id: 'all', label: 'All Records', count: mockData.timeline.length },
    { id: 'diabetes', label: 'Diabetes', count: 2 },
    { id: 'bp', label: 'Blood Pressure', count: 1 },
    { id: 'cholesterol', label: 'Cholesterol', count: 1 }
  ]
  
  const timeRanges = [
    { id: '1month', label: 'Last Month' },
    { id: '3months', label: 'Last 3 Months' },
    { id: '6months', label: 'Last 6 Months' },
    { id: '1year', label: 'Last Year' },
    { id: 'all', label: 'All Time' }
  ]

  const getIconForType = (type) => {
    switch (type) {
      case 'Lab Report': return TestTube
      case 'Prescription': return Pill
      case 'Consultation': return Stethoscope
      default: return FileText
    }
  }

  const getColorForStatus = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Reviewed': return 'bg-green-100 text-green-700 border-green-200'
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Resolved': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredTimeline = mockData.timeline.filter(item => {
    if (selectedFilter === 'all') return true
    return item.condition.toLowerCase().includes(selectedFilter)
  })

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
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Condition Filters */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Condition</label>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className={`ml-2 text-xs ${
                    selectedFilter === filter.id ? 'text-indigo-200' : 'text-gray-500'
                  }`}>
                    ({filter.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-500 to-indigo-500 opacity-30"></div>
        
        <div className="space-y-6">
          {filteredTimeline.map((item, index) => {
            const Icon = getIconForType(item.type)
            
            return (
              <div key={item.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-6 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full shadow-lg z-10"></div>
                
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            getColorForStatus(item.status)
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(item.date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span>{item.type}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span>{item.doctor}</span>
                            <span>•</span>
                            <span>{item.hospital}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/report-explanation')}
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
                    <button className="px-3 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-300">
                      View Details
                    </button>
                    <button className="px-3 py-1 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300">
                      Download
                    </button>
                    {item.condition.includes('Diabetes') && (
                      <button 
                        onClick={() => navigate('/cost-savings')}
                        className="px-3 py-1 text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-300"
                      >
                        View Savings
                      </button>
                    )}
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
            <button
              onClick={() => setSelectedFilter('all')}
              className="btn-secondary"
            >
              Clear Filters
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload New Record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline