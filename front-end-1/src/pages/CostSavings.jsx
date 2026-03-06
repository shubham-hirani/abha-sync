import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Pill, 
  ArrowRight,
  CheckCircle,
  ShoppingCart
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import StatCard from '../components/StatCard'
import { mockData } from '../mock/mockData'

const CostSavings = () => {
  const navigate = useNavigate()
  
  const savingsStats = [
    {
      title: "This Month",
      value: `₹${mockData.savings.monthlySavings.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      trend: { direction: "up", value: "+12% from last month" }
    },
    {
      title: "Total Saved",
      value: `₹${(mockData.savings.monthlySavings * 6).toLocaleString()}`,
      icon: TrendingUp,
      color: "indigo",
      trend: { direction: "up", value: "Last 6 months" }
    },
    {
      title: "Annual Projection",
      value: `₹${mockData.savings.yearlyProjected.toLocaleString()}`,
      icon: CheckCircle,
      color: "cyan",
      trend: { direction: "up", value: "Estimated savings" }
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cost Savings Analysis</h1>
        <p className="text-gray-600">
          See how much you can save with Jan Aushadhi generic medicines
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {savingsStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Medication Savings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Medication Cost Comparison</h2>
          
          <div className="space-y-4">
            {mockData.medications.map((med) => (
              <div key={med.id} className="p-4 border border-gray-200/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{med.name} {med.dosage}</h3>
                  <span className="text-sm text-gray-500">{med.frequency}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Brand Price</p>
                    <p className="text-lg font-bold text-red-600">₹{med.brandPrice}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Jan Aushadhi</p>
                    <p className="text-lg font-bold text-green-600">₹{med.janAushadhiPrice}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">You Save</p>
                    <p className="text-lg font-bold text-indigo-600">
                      ₹{med.savings}
                      <span className="text-sm font-normal text-gray-600 ml-1">
                        ({Math.round((med.savings / med.brandPrice) * 100)}%)
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Savings Progress</span>
                    <span>{Math.round((med.savings / med.brandPrice) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(med.savings / med.brandPrice) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-700">Total Monthly Savings</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              ₹{mockData.medications.reduce((sum, med) => sum + med.savings, 0)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Average {Math.round(mockData.medications.reduce((sum, med) => sum + (med.savings / med.brandPrice), 0) / mockData.medications.length * 100)}% savings across all medications
            </p>
          </div>
        </div>

        {/* Savings Chart & Map */}
        <div className="space-y-6">
          {/* Savings Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Savings Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.chartData.savingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`₹${value}`, 'Savings']}
                  />
                  <Bar 
                    dataKey="savings" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nearby Stores */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Nearby Jan Aushadhi Stores
            </h3>
            
            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl h-48 mb-4 flex items-center justify-center border border-blue-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Interactive Map</p>
                <p className="text-blue-500 text-sm">Find stores near you</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Jan Aushadhi Store - Andheri</p>
                  <p className="text-sm text-gray-500">2.3 km away • Open until 9 PM</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Directions
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Jan Aushadhi Store - Bandra</p>
                  <p className="text-sm text-gray-500">4.1 km away • Open 24/7</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/timeline')}
          className="btn-secondary flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          View Purchase History
        </button>
        
        <button
          onClick={() => navigate('/report-explanation')}
          className="btn-primary flex items-center gap-2"
        >
          Continue to Report Analysis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default CostSavings