'use client';

import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Observation } from '../../types/fhir';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  explanation: string;
  recommendation: string;
}

interface SafeSummaryProps {
  observations: Observation[];
}

export default function SafeSummaryPane({ observations }: SafeSummaryProps) {
  // Mock lab results - in real implementation, this would be derived from observations
  const labResults: LabResult[] = [
    {
      name: 'Glucose',
      value: 320,
      unit: 'mg/dL',
      status: 'critical',
      explanation: '⚠️ High: Values above 300 mg/dL can cause symptoms like excessive thirst, fatigue, and blurred vision.',
      recommendation: 'Monitor closely, increase water intake, and schedule an urgent doctor appointment.'
    },
    {
      name: 'Hemoglobin',
      value: 10.2,
      unit: 'g/dL',
      status: 'warning',
      explanation: '🔶 Slightly Low: May indicate mild anemia, which can cause fatigue and weakness.',
      recommendation: 'Increase iron-rich foods (spinach, red meat), take iron supplements if prescribed, and retest in 4-6 weeks.'
    },
    {
      name: 'Creatinine',
      value: 1.0,
      unit: 'mg/dL',
      status: 'normal',
      explanation: '✓ Normal: Kidney function is within expected range.',
      recommendation: 'No action needed. Continue with regular health checks.'
    }
  ];

  const hasCriticalValues = labResults.some(result => result.status === 'critical');

  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'critical':
        return 'border-red-500 bg-gradient-to-br from-red-50 to-red-50/50';
      case 'warning':
        return 'border-yellow-400 bg-yellow-50';
      case 'normal':
        return 'border-green-400 bg-green-50';
    }
  };

  const getStatusIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'normal':
        return <CheckCircle size={20} className="text-green-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Safety Triage Alert */}
      <div className={`med-card p-6 border-l-4 ${hasCriticalValues ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-50/50' : 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50/50'}`}>
        <div className="flex items-start gap-4">
          {hasCriticalValues ? (
            <AlertTriangle size={32} className="text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-1 ${hasCriticalValues ? 'text-red-700' : 'text-green-700'}`}>
              {hasCriticalValues ? '⚠️ Safety Alert: Consult Doctor' : '✓ All Clear: Stable'}
            </h2>
            <p className={`text-sm ${hasCriticalValues ? 'text-red-600' : 'text-green-600'}`}>
              {hasCriticalValues
                ? 'One or more values indicate potential health risks. Please consult with your healthcare provider immediately.'
                : 'Your lab results are within safe ranges.'}
            </p>
          </div>
        </div>
      </div>

      {/* Lab Results Explanation */}
      <div className="med-card p-6">
        <h3 className="text-2xl font-bold text-primary mb-6">Your Lab Results</h3>
        <div className="space-y-4">
          {labResults.map((result, index) => (
            <div key={index} className={`p-4 border-l-4 rounded ${getStatusColor(result.status)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{result.name}: {result.value} {result.unit}</div>
                  <p className="text-sm text-gray-700 mt-1">{result.explanation}</p>
                  <p className="text-xs text-gray-600 mt-2"><strong>Recommendation:</strong> {result.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="med-card p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h3 className="text-xl font-bold text-primary mb-4">📋 Action Plan</h3>
        <ol className="space-y-3">
          {hasCriticalValues && (
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
              <span className="text-red-700"><strong>Urgent:</strong> Contact your doctor within 24 hours for critical values</span>
            </li>
          )}
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span className="text-gray-700"><strong>This week:</strong> Consult about anemia management and iron supplementation</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span className="text-gray-700"><strong>Daily:</strong> Monitor blood glucose, keep emergency doctor contacts handy</span>
          </li>
        </ol>
      </div>
    </div>
  );
}