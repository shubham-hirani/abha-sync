import React from 'react'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'indigo', 
  onClick,
  subtitle 
}) => {
  const colorClasses = {
    indigo: 'from-indigo-500 to-blue-500 text-indigo-600 bg-indigo-50/50 border-indigo-200',
    green: 'from-green-500 to-emerald-500 text-green-600 bg-green-50/50 border-green-200',
    amber: 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50/50 border-amber-200',
    red: 'from-red-500 to-pink-500 text-red-600 bg-red-50/50 border-red-200',
    cyan: 'from-cyan-500 to-teal-500 text-cyan-600 bg-cyan-50/50 border-cyan-200'
  }

  const bgClass = colorClasses[color] || colorClasses.indigo

  return (
    <div 
      className={`card cursor-pointer group ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              trend.direction === 'up' 
                ? 'text-green-700 bg-green-100' 
                : trend.direction === 'down'
                ? 'text-red-700 bg-red-100'
                : 'text-gray-700 bg-gray-100'
            }`}>
              {trend.direction === 'up' && '↗'}
              {trend.direction === 'down' && '↘'}
              {trend.direction === 'neutral' && '→'}
              <span className="ml-1">{trend.value}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-r ${bgClass.split(' ')[0]} ${bgClass.split(' ')[1]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard