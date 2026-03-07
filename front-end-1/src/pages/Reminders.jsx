import React from 'react'
import { Pill, Plus } from 'lucide-react'
import { BetaBanner, BetaBlock, BetaFeature } from '../components/BetaFeature'

const Reminders = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medication Reminders</h1>
          <p className="text-gray-600 mt-1">
            Manage your medication schedule and never miss a dose
          </p>
        </div>

        <BetaFeature tooltip="Reminders functionality is coming soon">
          <button className="btn-primary flex items-center gap-2 w-fit" disabled>
            <Plus className="w-5 h-5" />
            Add Reminder
          </button>
        </BetaFeature>
      </div>

      <BetaBanner featureName="Medication Reminders" />

      {/* Active Reminders Summary */}
      <BetaBlock>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
            <span className="text-sm text-gray-500">2 active reminders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Metformin</span>
              </div>
              <p className="text-sm text-blue-600 mb-1">500mg - Twice daily</p>
              <p className="text-xs text-blue-700 font-medium">Next: 08:30 in 2h</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Atorvastatin</span>
              </div>
              <p className="text-sm text-blue-600 mb-1">20mg - Once daily at night</p>
              <p className="text-xs text-blue-700 font-medium">Next: 20:00 tonight</p>
            </div>
          </div>
        </div>
      </BetaBlock>
    </div>
  )
}

export default Reminders