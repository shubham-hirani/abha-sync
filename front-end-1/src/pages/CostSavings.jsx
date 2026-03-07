import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, MapPin, CheckCircle, ShoppingCart } from 'lucide-react'
import { BetaBanner, BetaBlock } from '../components/BetaFeature'
import StatCard from '../components/StatCard'

const CostSavings = () => {
  const navigate = useNavigate()

  const savingsStats = [
    {
      title: "This Month", value: `₹240`, icon: DollarSign, color: "green",
      trend: { direction: "up", value: "+12% from last month" }
    },
    {
      title: "Total Saved", value: `₹1440`, icon: TrendingUp, color: "indigo",
      trend: { direction: "up", value: "Last 6 months" }
    },
    {
      title: "Annual Projection", value: `₹2880`, icon: CheckCircle, color: "cyan",
      trend: { direction: "up", value: "Estimated savings" }
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cost Savings Analysis</h1>
        <p className="text-gray-600">See how much you can save with Jan Aushadhi generic medicines</p>
      </div>

      <BetaBanner featureName="Cost Savings & Jan Aushadhi" />

      {/* Stats Grid */}
      <BetaBlock>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsStats.map((stat, index) => <StatCard key={index} {...stat} />)}
        </div>
      </BetaBlock>

      <div className="grid lg:grid-cols-2 gap-6">
        <BetaBlock>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Medication Cost Comparison</h2>
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-700">Total Monthly Savings Placeholder</p>
              </div>
              <p className="text-2xl font-bold text-green-700">₹240</p>
            </div>
          </div>
        </BetaBlock>

        <BetaBlock>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" /> Nearby Jan Aushadhi Stores
            </h3>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl h-48 mb-4 border border-blue-200"></div>
          </div>
        </BetaBlock>
      </div>

      <div className="flex justify-center">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}

export default CostSavings