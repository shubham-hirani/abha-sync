import React from 'react'
import { X } from 'lucide-react'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className={`relative w-full ${sizeClasses[size]} transform transition-all`}>
          <div className="glass border border-white/20 rounded-2xl shadow-2xl">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                {title && (
                  <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                )}
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-all duration-300"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal