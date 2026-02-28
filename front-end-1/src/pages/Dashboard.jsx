import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import { mockData } from '../mock/mockData'

function Dashboard() {
  const navigate = useNavigate()

  const statsData = [
    {
      title: 'HbA1c Level',
      value: '8.5%',
      previous: '8.8%',
      change: -0.3,
      trend: 'down',
      unit: '',
      color: 'amber',
      description: 'Above target (7.0%)'
    },
    {
      title: 'Active Medications',
      value: '3',
      previous: '3',
      change: 0,
      trend: 'stable',
      color: 'blue',
      description: 'Metformin, Atorvastatin, Lisinopril'
    },
    {
      title: 'Monthly Savings',
      value: '₹2,840',
      previous: '₹2,650',
      change: 190,
      trend: 'up',
      color: 'green',
      description: 'Through Jan Aushadhi'
    },
    {
      title: 'Next Appointment',
      value: 'Nov 15',
      previous: 'Oct 18',
      change: 28,
      trend: 'up',
      color: 'indigo',
      description: 'Dr. Sharma (Endocrinologist)'
    }
  ]

  const tableColumns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('en-IN')
    },
    {
      key: 'condition',
      label: 'Condition',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-800">{value}</span>
      )
    },
    {
      key: 'doctor',
      label: 'Doctor',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'Ongoing': 'bg-amber-100 text-amber-700',
          'Controlled': 'bg-green-100 text-green-700',
          'Improving': 'bg-blue-100 text-blue-700',
          'Resolved': 'bg-gray-100 text-gray-700'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value] || 'bg-gray-100 text-gray-700'
          }`}>
            {value}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <button
          onClick={() => navigate('/report-explanation')}
          className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {mockData.user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your health overview for today, {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Upload className="w-5 h-5" />
          Upload New Record
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* HbA1c Trend Chart */}
        <div className="xl:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">HbA1c Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Last 5 months progression</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">8.5%</p>
                <p className="text-sm text-gray-500">Current Level</p>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.chartData.hba1cTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    domain={[7, 10]}
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
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-700">
                <strong>Target:</strong> Below 7.0% • 
                <strong>Current:</strong> 8.5% (Above target)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Health Alerts */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">HbA1c Above Target</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Current: 8.5% (Target: &lt;7.0%)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-red-700">High Cholesterol</p>
                    <p className="text-xs text-red-600 mt-1">
                      240 mg/dL (Target: &lt;200 mg/dL)
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/report-explanation')}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-3"
              >
                View Detailed Explanation →
              </button>
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Reminders</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-blue-700">Metformin</p>
                  <p className="text-xs text-blue-600">500mg • 9:00 PM</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  2h left
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-green-700">Atorvastatin</p>
                  <p className="text-xs text-green-600">10mg • 10:00 PM</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  3h left
                </span>
              </div>
              
              <button
                onClick={() => navigate('/reminders')}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-3"
              >
                Manage Reminders →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records Table */}
      <DataTable
        title="Recent Medical Records"
        data={mockData.records}
        columns={tableColumns}
        searchable={true}
        itemsPerPage={5}
      />
    </div>
  )
}

export default Dashboard