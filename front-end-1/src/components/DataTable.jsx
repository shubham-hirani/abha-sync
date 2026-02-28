import React from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

const DataTable = ({ 
  data = [], 
  columns = [], 
  title,
  searchable = true,
  filterable = false,
  pagination = true,
  itemsPerPage = 10 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' })

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let filtered = [...data]
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="card">
      {/* Header */}
      {(title || searchable || filterable) && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          
          <div className="flex items-center gap-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                />
              </div>
            )}
            
            {filterable && (
              <button className="p-2 rounded-lg border border-gray-200/50 bg-white/50 hover:bg-white/70 transition-all duration-300">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 font-medium text-gray-600 text-sm ${
                    column.sortable ? 'cursor-pointer hover:text-gray-800' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-indigo-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-white/30 transition-colors duration-300">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4 text-sm text-gray-700">
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No data state */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'No results found for your search.' : 'No data available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200/50 bg-white/50 hover:bg-white/70 disabled:opacity-50 disabled:hover:bg-white/50 transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                if (page === 1 || page === totalPages) return true
                if (Math.abs(page - currentPage) <= 1) return true
                return false
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const showEllipsis = index > 0 && array[index - 1] < page - 1
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-indigo-500 text-white'
                          : 'border border-gray-200/50 bg-white/50 hover:bg-white/70 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                )
              })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200/50 bg-white/50 hover:bg-white/70 disabled:opacity-50 disabled:hover:bg-white/50 transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable