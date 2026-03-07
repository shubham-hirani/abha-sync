'use client';

import { useState } from 'react';
import { MapPin, TrendingDown, Navigation } from 'lucide-react';
import { useAbhaSync } from '../../hooks/useAbhaSync';

interface DrugMapping {
  generic: string;
  savings: number;
  savingsPercentage: number;
}

interface KendraLocation {
  name: string;
  address: string;
  distance: string;
  phone?: string;
}

export default function SmartSwitchPane() {
  const [brand, setBrand] = useState('Crocin');
  const [mapping, setMapping] = useState<DrugMapping | null>(null);
  const { getDrugMapping, isLoading } = useAbhaSync();

  // Mock Kendra locations - in real implementation, this would come from Google Maps API
  const kendraLocations: KendraLocation[] = [
    {
      name: 'Jan Aushadhi Kendra - City Center',
      address: '123 Main Street, City Center',
      distance: '2.3 km',
      phone: '+91-9876543210'
    },
    {
      name: 'Jan Aushadhi Kendra - Medical Complex',
      address: '456 Health Avenue, Medical District',
      distance: '4.1 km',
      phone: '+91-9876543211'
    },
    {
      name: 'Jan Aushadhi Kendra - Suburban Branch',
      address: '789 Wellness Road, Suburban Area',
      distance: '6.8 km',
      phone: '+91-9876543212'
    }
  ];

  const handleLookup = async () => {
    try {
      const data = await getDrugMapping(brand);
      setMapping(data);
    } catch (error) {
      // For demo purposes, set mock data
      setMapping({
        generic: 'Paracetamol',
        savings: 45,
        savingsPercentage: 70
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="med-card p-6 border-l-4 border-secondary">
        <label className="block text-lg font-bold text-primary mb-3">Search Brand Name</label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g., Crocin, Aspirin..."
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <button
          onClick={handleLookup}
          disabled={isLoading}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          🔍 {isLoading ? 'Searching...' : 'Find Generic Alternative'}
        </button>
        {mapping && (
          <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-700 font-semibold mb-1">Generic Equivalent</div>
            <div className="font-bold text-lg text-primary mb-3">{mapping.generic}</div>
            <div className="flex items-center gap-2 badge-safe">
              <TrendingDown size={18} />
              <span>Save {mapping.savingsPercentage}% (₹{mapping.savings} per unit)</span>
            </div>
          </div>
        )}
      </div>

      <div className="med-card p-6 border-l-4 border-accent">
        <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-accent" /> Nearest Jan Aushadhi Kendras
        </h3>
        <div className="space-y-4 mb-4">
          {kendraLocations.map((kendra, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{kendra.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{kendra.address}</div>
                  {kendra.phone && (
                    <div className="text-sm text-gray-600">{kendra.phone}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">{kendra.distance}</div>
                  <button className="mt-2 text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1">
                    <Navigation size={12} />
                    Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border border-slate-200">
          <iframe
            title="Jan Aushadhi Kendra Locations"
            width="100%"
            height="100%"
            src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOMLD0k9XKTtf8&q=jan+aushadhi+kendra+near+me`}
            style={{ border: 'none' }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}