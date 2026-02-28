import React from 'react'
import { 
  Bell, 
  Plus, 
  Pill, 
  Clock, 
  MoreVertical,
  Edit3,
  Trash2,
  Check
} from 'lucide-react'

import Modal from '../components/Modal'
import { mockData } from '../mock/mockData'

const Reminders = () => {
  const [reminders, setReminders] = React.useState(mockData.medications)
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingReminder, setEditingReminder] = React.useState(null)
  const [newReminder, setNewReminder] = React.useState({
    name: '',
    dosage: '',
    frequency: '',
    time: [''],
    enabled: true
  })

  const handleToggleReminder = (id) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ))
  }

  const handleTimeChange = (id, timeIndex, newTime) => {
    setReminders(prev => prev.map(reminder => {
      if (reminder.id === id) {
        const newTimes = [...reminder.time]
        newTimes[timeIndex] = newTime
        return { ...reminder, time: newTimes }
      }
      return reminder
    }))
  }

  const handleAddReminder = () => {
    const id = Math.max(...reminders.map(r => r.id)) + 1
    const reminder = {
      ...newReminder,
      id,
      brandPrice: 100,
      janAushadhiPrice: 30,
      savings: 70
    }
    
    setReminders(prev => [...prev, reminder])
    setNewReminder({
      name: '',
      dosage: '',
      frequency: '',
      time: [''],
      enabled: true
    })
    setShowAddModal(false)
  }

  const handleDeleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const addTimeSlot = () => {
    setNewReminder(prev => ({
      ...prev,
      time: [...prev.time, '']
    }))
  }

  const removeTimeSlot = (index) => {
    if (newReminder.time.length > 1) {
      setNewReminder(prev => ({
        ...prev,
        time: prev.time.filter((_, i) => i !== index)
      }))
    }
  }

  const updateTimeSlot = (index, time) => {
    setNewReminder(prev => ({
      ...prev,
      time: prev.time.map((t, i) => i === index ? time : t)
    }))
  }

  const getNextReminderTime = (times, enabled) => {
    if (!enabled || !times || times.length === 0) return null
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const todayTimes = times
      .map(time => {
        const [hours, minutes] = time.split(':')
        return parseInt(hours) * 60 + parseInt(minutes)
      })
      .filter(time => time > currentTime)
      .sort((a, b) => a - b)
    
    if (todayTimes.length > 0) {
      const nextTime = todayTimes[0]
      const hours = Math.floor(nextTime / 60)
      const minutes = nextTime % 60
      const timeLeft = nextTime - currentTime
      
      if (timeLeft <= 120) { // Next 2 hours
        return `${Math.floor(timeLeft / 60)}h ${timeLeft % 60}m left`
      }
      return `Next: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    return 'Tomorrow'
  }

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
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          Add Reminder
        </button>
      </div>

      {/* Active Reminders Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
          <span className="text-sm text-gray-500">
            {reminders.filter(r => r.enabled).length} active reminders
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.filter(r => r.enabled).map(reminder => {
            const nextTime = getNextReminderTime(reminder.time, reminder.enabled)
            
            return (
              <div key={reminder.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">{reminder.name}</span>
                </div>
                <p className="text-sm text-blue-600 mb-1">{reminder.dosage}</p>
                {nextTime && (
                  <p className="text-xs text-blue-700 font-medium">{nextTime}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  reminder.enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Pill className={`w-6 h-6 ${
                    reminder.enabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reminder.name} {reminder.dosage}
                  </h3>
                  <p className="text-gray-600">{reminder.frequency}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => handleToggleReminder(reminder.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                
                {/* Menu Button */}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {reminder.time.map((time, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-200/50">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(reminder.id, index, e.target.value)}
                    disabled={!reminder.enabled}
                    className={`flex-1 bg-transparent text-sm font-mono focus:outline-none ${
                      reminder.enabled ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reminder.enabled 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {reminder.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
              <div className="flex items-center gap-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              
              {reminder.enabled && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {getNextReminderTime(reminder.time, reminder.enabled)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Next reminder
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Medication Reminder"
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication Name
              </label>
              <input
                type="text"
                value={newReminder.name}
                onChange={(e) => setNewReminder(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Metformin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage
              </label>
              <input
                type="text"
                value={newReminder.dosage}
                onChange={(e) => setNewReminder(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={newReminder.frequency}
              onChange={(e) => setNewReminder(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select frequency...</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Reminder Times
              </label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Time
              </button>
            </div>
            
            <div className="space-y-2">
              {newReminder.time.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {newReminder.time.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReminder}
              disabled={!newReminder.name || !newReminder.dosage || !newReminder.frequency || newReminder.time.some(t => !t)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Reminder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Reminders