import React from 'react'
import { Upload, FileText, X, Image, Loader } from 'lucide-react'

const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes = ['image/*', '.pdf'],
  maxSize = 10, // MB
  multiple = false,
  preview = true,
  processing = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState([])
  const fileInputRef = React.useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.split('/')[0])
        }
        return file.type === type || file.name.toLowerCase().endsWith(type)
      })
      
      // Check file size
      const isValidSize = file.size <= maxSize * 1024 * 1024
      
      return isValidType && isValidSize
    })

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
      
      if (multiple) {
        setUploadedFiles(prev => [...prev, ...newFiles])
        onFileSelect?.(uploadedFiles.concat(newFiles))
      } else {
        setUploadedFiles([newFiles[0]])
        onFileSelect?.(newFiles[0])
      }
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      onFileSelect?.(multiple ? updated : updated[0] || null)
      return updated
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image
    return FileText
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50/50'
            : 'border-gray-300 hover:border-gray-400 bg-white/30'
        } ${processing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !processing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={processing}
        />
        
        {processing ? (
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Processing...</p>
            <p className="text-sm text-gray-500">AI is analyzing your document</p>
          </div>
        ) : (
          <>
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              isDragging ? 'text-indigo-500' : 'text-gray-400'
            }`} />
            
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              or <span className="text-indigo-600 font-medium">browse</span> to choose files
            </p>
            
            <div className="text-xs text-gray-400">
              <p>Supported: {acceptedTypes.join(', ')}</p>
              <p>Max size: {maxSize}MB{multiple ? ' per file' : ''}</p>
            </div>
          </>
        )}
      </div>

      {/* File Preview */}
      {preview && uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            {multiple ? 'Uploaded Files:' : 'Uploaded File:'}
          </h4>
          
          {uploadedFiles.map((fileData) => {
            const FileIcon = getFileIcon(fileData.type)
            
            return (
              <div key={fileData.id} className="glass rounded-xl p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {fileData.type.startsWith('image/') ? (
                      <img
                        src={fileData.url}
                        alt={fileData.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {fileData.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.size)}
                    </p>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(fileData.id)
                    }}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUpload