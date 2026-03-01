const { extractMedicalData } = require('../src/services/extractor');

describe('AI Extraction Service', () => {
  describe('extractMedicalData', () => {
    test('should extract patient name from text', () => {
      const text = 'Patient: Mr. Rohan Sharma visited the hospital for checkup';
      const result = extractMedicalData(text);
      expect(result.patient.name).toBe('Rohan Sharma');
    });

    test('should extract doctor name from text', () => {
      const text = 'Consultation with Dr. Mehta regarding diabetes management';
      const result = extractMedicalData(text);
      expect(result.doctor.name).toContain('Mehta');
    });

    test('should extract diagnosis from text', () => {
      const text = 'Diagnosis: Type 2 Diabetes. Prescribed medication for management.';
      const result = extractMedicalData(text);
      expect(result.diagnosis).toContain('Type 2 Diabetes');
    });

    test('should extract medicines from text', () => {
      const text = 'Patient was prescribed metformin 500mg twice daily and atorvastatin 10mg once daily';
      const result = extractMedicalData(text);
      expect(result.medicines.length).toBeGreaterThan(0);
      const names = result.medicines.map(m => m.name.toLowerCase());
      expect(names).toContain('metformin');
    });

    test('should extract lab values from text', () => {
      const text = 'Lab results: HbA1c: 8.5 %, Cholesterol: 240 mg/dL';
      const result = extractMedicalData(text);
      expect(result.labValues.length).toBeGreaterThan(0);
    });

    test('should calculate confidence score', () => {
      const text = 'Patient: Mr. Rohan. Dr. Mehta. Diagnosis: Diabetes. Prescribed metformin. HbA1c: 8.5 %';
      const result = extractMedicalData(text);
      expect(result.confidenceScore).toBeGreaterThan(0.5);
      expect(result.confidenceScore).toBeLessThanOrEqual(1.0);
    });

    test('should handle empty text', () => {
      const result = extractMedicalData('');
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.doctor.name).toBe('Unknown Doctor');
      expect(result.confidenceScore).toBe(0);
    });

    test('should handle null input', () => {
      const result = extractMedicalData(null);
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.confidenceScore).toBe(0);
    });

    test('should handle text with no medical content', () => {
      const text = 'The weather is nice today and I went to the park for a walk';
      const result = extractMedicalData(text);
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.confidenceScore).toBeLessThanOrEqual(0.6);
    });

    test('should include extraction timestamp', () => {
      const result = extractMedicalData('Some medical text with diagnosis of fever');
      expect(result.extractedAt).toBeDefined();
      expect(new Date(result.extractedAt)).toBeInstanceOf(Date);
    });

    test('should extract multiple medicines', () => {
      const text = 'Prescribed metformin, atorvastatin, and amlodipine for the patient';
      const result = extractMedicalData(text);
      expect(result.medicines.length).toBeGreaterThanOrEqual(3);
    });

    test('should detect common conditions by keyword', () => {
      const text = 'Patient shows signs of hypertension and diabetes';
      const result = extractMedicalData(text);
      const diagLower = result.diagnosis.map(d => d.toLowerCase());
      expect(diagLower.some(d => d.includes('hypertension') || d.includes('diabetes'))).toBe(true);
    });
  });
});
