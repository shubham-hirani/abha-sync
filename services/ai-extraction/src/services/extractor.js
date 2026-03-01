/**
 * Mock AI Medical Data Extractor
 * 
 * In production, this would call an LLM (GPT-4, Med-PaLM, etc.)
 * For MVP, uses pattern matching to simulate extraction.
 */

// Common medical patterns
const DOCTOR_PATTERNS = /(?:Dr\.?\s*|Doctor\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
const DIAGNOSIS_PATTERNS = /(?:diagnosis|diagnosed with|condition|impression|assessment)[:\s]*([^\n,.]+)/gi;
const MEDICINE_PATTERNS = /(?:prescribed|medication|medicine|tablet|tab|cap|capsule)[:\s]*([^\n]+)/gi;
const DOSAGE_PATTERN = /(\d+\s*(?:mg|ml|mcg|g|units?))/gi;
const FREQUENCY_PATTERN = /(once|twice|thrice|daily|weekly|monthly|(?:\d+\s*times?\s*(?:a|per)\s*day))/gi;
const LAB_VALUE_PATTERN = /([A-Za-z\s]+)[:\s]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L|%|ng\/mL|g\/dL|U\/L|mIU\/L|mmHg|cells\/μL)/gi;
const PATIENT_PATTERN = /(?:patient|name|Mr\.|Mrs\.|Ms\.)[:\s]*(?:Mr\.|Mrs\.|Ms\.)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g;
const HOSPITAL_PATTERN = /(?:hospital|clinic|medical center|healthcare)[:\s]*([^\n,]+)/gi;
const DATE_PATTERN = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;

// Known medicine dictionary for mock extraction
const KNOWN_MEDICINES = {
  metformin: { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', category: 'Anti-diabetic' },
  atorvastatin: { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', category: 'Statin' },
  amlodipine: { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', category: 'Anti-hypertensive' },
  aspirin: { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', category: 'Anti-platelet' },
  omeprazole: { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', category: 'PPI' },
  amoxicillin: { name: 'Amoxicillin', dosage: '500mg', frequency: 'Thrice daily', category: 'Antibiotic' },
  paracetamol: { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', category: 'Analgesic' },
  losartan: { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', category: 'ARB' },
  insulin: { name: 'Insulin', dosage: '10 units', frequency: 'Before meals', category: 'Anti-diabetic' },
  clopidogrel: { name: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', category: 'Anti-platelet' },
};

function extractPatient(text) {
  const matches = [...text.matchAll(PATIENT_PATTERN)];
  if (matches.length > 0) {
    return { name: matches[0][1].trim() };
  }
  return { name: 'Unknown Patient' };
}

function extractDoctor(text) {
  const matches = [...text.matchAll(DOCTOR_PATTERNS)];
  if (matches.length > 0) {
    return { name: `Dr. ${matches[0][1].trim()}` };
  }
  return { name: 'Unknown Doctor' };
}

function extractDiagnosis(text) {
  const matches = [...text.matchAll(DIAGNOSIS_PATTERNS)];
  if (matches.length > 0) {
    return matches.map((m) => m[1].trim());
  }
  // Fallback: look for common conditions
  const conditions = ['diabetes', 'hypertension', 'cholesterol', 'asthma', 'fever', 'infection', 'anemia'];
  const found = conditions.filter((c) => text.toLowerCase().includes(c));
  return found.length > 0 ? found.map((f) => f.charAt(0).toUpperCase() + f.slice(1)) : ['General Consultation'];
}

function extractMedicines(text) {
  const medicines = [];
  const lowerText = text.toLowerCase();

  // Check for known medicines in text
  for (const [key, medicine] of Object.entries(KNOWN_MEDICINES)) {
    if (lowerText.includes(key)) {
      medicines.push({ ...medicine });
    }
  }

  // Also try pattern-based extraction
  const medMatches = [...text.matchAll(MEDICINE_PATTERNS)];
  for (const match of medMatches) {
    const medLine = match[1].trim();
    const dosageMatch = medLine.match(DOSAGE_PATTERN);
    const freqMatch = medLine.match(FREQUENCY_PATTERN);
    
    const medName = medLine.split(/\s+/)[0];
    if (medName && !medicines.find((m) => m.name.toLowerCase() === medName.toLowerCase())) {
      medicines.push({
        name: medName,
        dosage: dosageMatch ? dosageMatch[0] : 'As directed',
        frequency: freqMatch ? freqMatch[0] : 'As directed',
        category: 'General',
      });
    }
  }

  return medicines.length > 0 ? medicines : [{ name: 'None identified', dosage: '-', frequency: '-', category: '-' }];
}

function extractLabValues(text) {
  const labValues = [];
  const matches = [...text.matchAll(LAB_VALUE_PATTERN)];

  for (const match of matches) {
    labValues.push({
      parameter: match[1].trim(),
      value: parseFloat(match[2]),
      unit: match[3],
    });
  }

  // Check for common lab values by name
  const commonLabs = {
    'hba1c': { parameter: 'HbA1c', normalRange: '< 7.0%', unit: '%' },
    'blood sugar': { parameter: 'Blood Sugar', normalRange: '70-100 mg/dL', unit: 'mg/dL' },
    'cholesterol': { parameter: 'Cholesterol', normalRange: '< 200 mg/dL', unit: 'mg/dL' },
    'hemoglobin': { parameter: 'Hemoglobin', normalRange: '13-17 g/dL', unit: 'g/dL' },
    'creatinine': { parameter: 'Creatinine', normalRange: '0.7-1.3 mg/dL', unit: 'mg/dL' },
    'vitamin d': { parameter: 'Vitamin D', normalRange: '30-100 ng/mL', unit: 'ng/mL' },
  };

  const lowerText = text.toLowerCase();
  for (const [key, lab] of Object.entries(commonLabs)) {
    if (lowerText.includes(key) && !labValues.find((l) => l.parameter.toLowerCase() === key)) {
      const valueMatch = new RegExp(`${key}[:\\s]*(\\d+\\.?\\d*)`, 'i').exec(text);
      if (valueMatch) {
        labValues.push({
          ...lab,
          value: parseFloat(valueMatch[1]),
        });
      }
    }
  }

  return labValues;
}

function calculateConfidence(extracted) {
  let score = 0.5; // Base confidence for any extraction

  if (extracted.patient.name !== 'Unknown Patient') score += 0.1;
  if (extracted.doctor.name !== 'Unknown Doctor') score += 0.1;
  if (extracted.diagnosis.length > 0 && extracted.diagnosis[0] !== 'General Consultation') score += 0.1;
  if (extracted.medicines.length > 0 && extracted.medicines[0].name !== 'None identified') score += 0.1;
  if (extracted.labValues.length > 0) score += 0.1;

  return Math.min(score, 1.0);
}

function extractMedicalData(text) {
  if (!text || typeof text !== 'string') {
    return {
      patient: { name: 'Unknown Patient' },
      doctor: { name: 'Unknown Doctor' },
      diagnosis: [],
      medicines: [],
      labValues: [],
      confidenceScore: 0,
      extractedAt: new Date().toISOString(),
    };
  }

  const patient = extractPatient(text);
  const doctor = extractDoctor(text);
  const diagnosis = extractDiagnosis(text);
  const medicines = extractMedicines(text);
  const labValues = extractLabValues(text);

  const extracted = { patient, doctor, diagnosis, medicines, labValues };
  const confidenceScore = calculateConfidence(extracted);

  return {
    ...extracted,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    extractedAt: new Date().toISOString(),
  };
}

module.exports = { extractMedicalData };
