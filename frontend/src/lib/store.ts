import { create } from 'zustand';
import { MedicationRequest, Observation, Condition } from '../types/fhir';

interface PrescriptionState {
  currentPrescription: {
    medications: MedicationRequest[];
    observations: Observation[];
    conditions: Condition[];
    rawText?: string;
  } | null;
  setCurrentPrescription: (prescription: PrescriptionState['currentPrescription']) => void;
  updateMedication: (index: number, medication: MedicationRequest) => void;
  updateObservation: (index: number, observation: Observation) => void;
  updateCondition: (index: number, condition: Condition) => void;
  clearPrescription: () => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
  currentPrescription: null,
  setCurrentPrescription: (prescription) => set({ currentPrescription: prescription }),
  updateMedication: (index, medication) =>
    set((state) => ({
      currentPrescription: state.currentPrescription ? {
        ...state.currentPrescription,
        medications: state.currentPrescription.medications.map((med, i) =>
          i === index ? medication : med
        ),
      } : null,
    })),
  updateObservation: (index, observation) =>
    set((state) => ({
      currentPrescription: state.currentPrescription ? {
        ...state.currentPrescription,
        observations: state.currentPrescription.observations.map((obs, i) =>
          i === index ? observation : obs
        ),
      } : null,
    })),
  updateCondition: (index, condition) =>
    set((state) => ({
      currentPrescription: state.currentPrescription ? {
        ...state.currentPrescription,
        conditions: state.currentPrescription.conditions.map((cond, i) =>
          i === index ? condition : cond
        ),
      } : null,
    })),
  clearPrescription: () => set({ currentPrescription: null }),
}));