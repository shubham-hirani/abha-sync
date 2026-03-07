import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Eye, Trash2, RefreshCw, FileText } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import { BetaBanner, BetaBlock } from '../components/BetaFeature'
import { useAuth } from '../context/AuthContext'
import { useRecords } from '../context/RecordsContext'
import { mockData } from '../mock/mockData'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { records, loading, error, fetchRecords, deleteRecord, totalRecords } = useRecords()

  // Derive a friendly display name from email
  const displayName = user?.email ? user.email.split('@')[0] : 'there'

  // ─── Table Columns for real records ────────────────────────────────────────
  const tableColumns = [
    {
      key: 'uploaded_at',
      label: 'Date',
      sortable: true,
      render: (value) =>
        value ? new Date(value).toLocaleDateString('en-IN') : '—',
    },
    {
      key: 'file_name',
      label: 'File',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-medium text-gray-800 truncate max-w-48">{value}</span>
        </div>
      ),
    },
    {
      key: 'record_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'ai_analysis',
      label: 'AI Analysis',
      render: (value) =>
        value ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            ✓ Done
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Pending
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sessionStorage.setItem('current_record_id', row.id)
              navigate('/review-extraction')
            }}
            className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            title="View record"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              if (confirm('Delete this record?')) {
                await deleteRecord(row.id)
              }
            }}
            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-300"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ─── Stats cards (real: total records; rest are beta) ──────────────────────
  const statsData = [
    {
      title: 'Total Records',
      value: String(totalRecords),
      previous: '',
      change: 0,
      trend: 'stable',
      color: 'indigo',
      description: 'Records uploaded',
    },
    {
      title: 'HbA1c Level',
      value: '—',
      previous: '',
      change: 0,
      trend: 'stable',
      color: 'amber',
      description: 'Beta feature',
    },
    {
      title: 'Monthly Savings',
      value: '—',
      previous: '',
      change: 0,
      trend: 'stable',
      color: 'green',
      description: 'Beta feature',
    },
    {
      title: 'Next Appointment',
      value: '—',
      previous: '',
      change: 0,
      trend: 'stable',
      color: 'blue',
      description: 'Beta feature',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {displayName} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your health overview for today,{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
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
        {/* Real: total records */}
        <StatCard {...statsData[0]} />
        {/* Beta: health metrics */}
        {statsData.slice(1).map((stat, i) => (
          <BetaBlock key={i} className="relative h-full" tooltip={`${stat.title} will be available in the next release.`}>
            <span className="absolute top-3 right-3 z-10 px-1.5 py-0.5 text-xs font-bold bg-amber-400 text-white rounded-md shadow-sm">
              BETA
            </span>
            <StatCard {...stat} />
          </BetaBlock>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* HbA1c Trend Chart — Beta */}
        <div className="xl:col-span-2">
          <BetaBlock className="card relative h-full" tooltip="HbA1c chart monitoring will be available when integration is complete.">
            <BetaBanner featureName="HbA1c Trend Chart" />
            <div className="flex items-center justify-between mb-6 mt-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">HbA1c Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Last 5 months progression</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">—</p>
                <p className="text-sm text-gray-500">Current Level</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.chartData.hba1cTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis domain={[7, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </BetaBlock>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Health Alerts — Beta */}
          <BetaBlock className="card" tooltip="Intelligent health alerts will be available soon.">
            <BetaBanner featureName="Health Alerts" />
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-2">Health Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">HbA1c Above Target</p>
                    <p className="text-xs text-amber-600 mt-1">Requires AI analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </BetaBlock>

          {/* Today's Reminders — Beta */}
          <BetaBlock className="card" tooltip="Medication reminders will be available soon.">
            <BetaBanner featureName="Today's Reminders" />
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-2">Today's Reminders</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-blue-700">Medication reminders</p>
                  <p className="text-xs text-blue-600">Beta feature</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-3 disabled:pointer-events-none"
            >
              Manage Reminders →
            </button>
          </BetaBlock>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mr-3" />
          <p className="text-gray-600">Loading your records…</p>
        </div>
      ) : error ? (
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchRecords}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      ) : (
        <DataTable
          title="My Medical Records"
          data={records}
          columns={tableColumns}
          searchable={true}
          itemsPerPage={5}
          emptyMessage={
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No records yet.</p>
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload First Record
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}

export default Dashboard