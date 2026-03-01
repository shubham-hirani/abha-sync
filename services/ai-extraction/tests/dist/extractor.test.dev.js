"use strict";

var _require = require('../src/services/extractor'),
    extractMedicalData = _require.extractMedicalData;

describe('AI Extraction Service', function () {
  describe('extractMedicalData', function () {
    test('should extract patient name from text', function () {
      var text = 'Patient: Mr. Rohan Sharma visited the hospital for checkup';
      var result = extractMedicalData(text);
      expect(result.patient.name).toBe('Rohan Sharma');
    });
    test('should extract doctor name from text', function () {
      var text = 'Consultation with Dr. Mehta regarding diabetes management';
      var result = extractMedicalData(text);
      expect(result.doctor.name).toContain('Mehta');
    });
    test('should extract diagnosis from text', function () {
      var text = 'Diagnosis: Type 2 Diabetes. Prescribed medication for management.';
      var result = extractMedicalData(text);
      expect(result.diagnosis).toContain('Type 2 Diabetes');
    });
    test('should extract medicines from text', function () {
      var text = 'Patient was prescribed metformin 500mg twice daily and atorvastatin 10mg once daily';
      var result = extractMedicalData(text);
      expect(result.medicines.length).toBeGreaterThan(0);
      var names = result.medicines.map(function (m) {
        return m.name.toLowerCase();
      });
      expect(names).toContain('metformin');
    });
    test('should extract lab values from text', function () {
      var text = 'Lab results: HbA1c: 8.5 %, Cholesterol: 240 mg/dL';
      var result = extractMedicalData(text);
      expect(result.labValues.length).toBeGreaterThan(0);
    });
    test('should calculate confidence score', function () {
      var text = 'Patient: Mr. Rohan. Dr. Mehta. Diagnosis: Diabetes. Prescribed metformin. HbA1c: 8.5 %';
      var result = extractMedicalData(text);
      expect(result.confidenceScore).toBeGreaterThan(0.5);
      expect(result.confidenceScore).toBeLessThanOrEqual(1.0);
    });
    test('should handle empty text', function () {
      var result = extractMedicalData('');
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.doctor.name).toBe('Unknown Doctor');
      expect(result.confidenceScore).toBe(0);
    });
    test('should handle null input', function () {
      var result = extractMedicalData(null);
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.confidenceScore).toBe(0);
    });
    test('should handle text with no medical content', function () {
      var text = 'The weather is nice today and I went to the park for a walk';
      var result = extractMedicalData(text);
      expect(result.patient.name).toBe('Unknown Patient');
      expect(result.confidenceScore).toBeLessThanOrEqual(0.6);
    });
    test('should include extraction timestamp', function () {
      var result = extractMedicalData('Some medical text with diagnosis of fever');
      expect(result.extractedAt).toBeDefined();
      expect(new Date(result.extractedAt)).toBeInstanceOf(Date);
    });
    test('should extract multiple medicines', function () {
      var text = 'Prescribed metformin, atorvastatin, and amlodipine for the patient';
      var result = extractMedicalData(text);
      expect(result.medicines.length).toBeGreaterThanOrEqual(3);
    });
    test('should detect common conditions by keyword', function () {
      var text = 'Patient shows signs of hypertension and diabetes';
      var result = extractMedicalData(text);
      var diagLower = result.diagnosis.map(function (d) {
        return d.toLowerCase();
      });
      expect(diagLower.some(function (d) {
        return d.includes('hypertension') || d.includes('diabetes');
      })).toBe(true);
    });
  });
});