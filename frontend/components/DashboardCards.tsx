import { Heart, FileText, Clipboard } from 'lucide-react'

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="med-card p-6 border-l-4 border-secondary">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <FileText size={28} className="text-secondary" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Total Records Digitized</div>
            <div className="text-3xl font-bold text-primary">1,248</div>
          </div>
        </div>
      </div>
      <div className="med-card p-6 border-l-4 border-accent">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Clipboard size={28} className="text-accent" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Active Prescriptions</div>
            <div className="text-3xl font-bold text-primary">78</div>
          </div>
        </div>
      </div>
      <div className="med-card p-6 border-l-4 border-green-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Heart size={28} className="text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Jan Aushadhi Savings</div>
            <div className="text-3xl font-bold text-green-600">₹12,430</div>
          </div>
        </div>
      </div>
    </div>
  )}