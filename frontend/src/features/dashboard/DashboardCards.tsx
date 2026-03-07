import { Heart, FileText, Clipboard, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface SyncStatus {
  status: 'syncing' | 'success' | 'failed';
  message?: string;
}

interface DashboardCardsProps {
  syncStatus?: SyncStatus;
}

export default function DashboardCards({ syncStatus = { status: 'success' } }: DashboardCardsProps) {
  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="med-card p-6 border-l-4 border-secondary relative">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-lg">
            <FileText size={28} className="text-secondary" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Total Records Digitized</div>
            <div className="text-3xl font-bold text-primary">1,248</div>
          </div>
        </div>
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(syncStatus.status)}`}>
          {getStatusIcon(syncStatus.status)}
          <span className="capitalize">{syncStatus.status}</span>
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
  )
}