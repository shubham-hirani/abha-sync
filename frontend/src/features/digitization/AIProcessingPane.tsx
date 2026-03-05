'use client';

import { useState } from 'react';
import { Save, Edit3 } from 'lucide-react';
import { usePrescriptionStore } from '../../lib/store';
import { MedicationRequest, Condition } from '../../types/fhir';
import { useAbhaSync } from '../../hooks/useAbhaSync';

interface MedicationFormData {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface DiagnosisFormData {
  code: string;
  display: string;
}

export default function AIProcessingPane() {
  const { currentPrescription, setCurrentPrescription, updateMedication, updateCondition } = usePrescriptionStore();
  const { saveToFHIR, isLoading } = useAbhaSync();
  const [isEditing, setIsEditing] = useState(false);
  const [medications, setMedications] = useState<MedicationFormData[]>(
    currentPrescription?.medications.map(med => ({
      name: med.medicationCodeableConcept.text || '',
      dose: med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + ' ' + med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || '',
      frequency: med.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.display || '',
      duration: med.dispenseRequest?.expectedSupplyDuration?.value + ' ' + med.dispenseRequest?.expectedSupplyDuration?.unit || '',
    })) || []
  );
  const [diagnoses, setDiagnoses] = useState<DiagnosisFormData[]>(
    currentPrescription?.conditions.map(cond => ({
      code: cond.code.coding?.[0]?.code || '',
      display: cond.code.text || '',
    })) || []
  );

  const handleSave = async () => {
    try {
      // Convert form data back to FHIR format
      const fhirMedications: MedicationRequest[] = medications.map((med, index) => ({
        resourceType: 'MedicationRequest',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: `med-${index}`,
            display: med.name,
          }],
          text: med.name,
        },
        subject: {
          reference: 'Patient/example',
        },
        dosageInstruction: [{
          text: `${med.dose} ${med.frequency}`,
          doseAndRate: [{
            doseQuantity: {
              value: parseFloat(med.dose.split(' ')[0]) || 0,
              unit: med.dose.split(' ').slice(1).join(' ') || 'mg',
              system: 'http://unitsofmeasure.org',
              code: 'mg',
            },
          }],
        }],
        dispenseRequest: {
          expectedSupplyDuration: {
            value: parseFloat(med.duration.split(' ')[0]) || 0,
            unit: med.duration.split(' ').slice(1).join(' ') || 'days',
          },
        },
      }));

      const fhirConditions: Condition[] = diagnoses.map((diag, index) => ({
        resourceType: 'Condition',
        code: {
          coding: [{
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: diag.code,
            display: diag.display,
          }],
          text: diag.display,
        },
        subject: {
          reference: 'Patient/example',
        },
      }));

      await saveToFHIR({
        medications: fhirMedications,
        conditions: fhirConditions,
      });

      setCurrentPrescription({
        medications: fhirMedications,
        conditions: fhirConditions,
        observations: currentPrescription?.observations || [],
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save to FHIR:', error);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="med-card p-6 border-l-4 border-secondary">
        <h3 className="font-bold text-lg text-primary mb-4">Document Viewer</h3>
        <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>Scan preview</p>
            <p className="text-xs">(PDF/image)</p>
          </div>
        </div>
      </div>
      <div className="med-card p-6 border-l-4 border-accent">
        <h3 className="font-bold text-lg text-primary mb-4">Extracted Data (Editable FHIR Form)</h3>
        <div className="space-y-6">
          {/* Medications Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Medications</label>
            {medications.map((med, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Drug Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => {
                        const newMeds = [...medications];
                        newMeds[index].name = e.target.value;
                        setMedications(newMeds);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={med.dose}
                      onChange={(e) => {
                        const newMeds = [...medications];
                        newMeds[index].dose = e.target.value;
                        setMedications(newMeds);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => {
                        const newMeds = [...medications];
                        newMeds[index].frequency = e.target.value;
                        setMedications(newMeds);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => {
                        const newMeds = [...medications];
                        newMeds[index].duration = e.target.value;
                        setMedications(newMeds);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnoses Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Diagnoses (ICD-10)</label>
            {diagnoses.map((diag, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">ICD-10 Code</label>
                    <input
                      type="text"
                      value={diag.code}
                      onChange={(e) => {
                        const newDiags = [...diagnoses];
                        newDiags[index].code = e.target.value;
                        setDiagnoses(newDiags);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={diag.display}
                      onChange={(e) => {
                        const newDiags = [...diagnoses];
                        newDiags[index].display = e.target.value;
                        setDiagnoses(newDiags);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save to FHIR'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                Edit & Verify
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}