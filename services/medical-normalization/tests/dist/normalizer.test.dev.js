"use strict";

var _require = require('../src/services/normalizer'),
    normalizeDiagnosis = _require.normalizeDiagnosis,
    normalizeMedicines = _require.normalizeMedicines,
    similarity = _require.similarity,
    findBestMatch = _require.findBestMatch;

describe('Medical Normalization Service', function () {
  describe('normalizeDiagnosis', function () {
    test('should map known diagnosis to ICD-10 code', function () {
      var result = normalizeDiagnosis('Type 2 Diabetes');
      expect(result.icdCode).toBe('E11');
      expect(result.confidence).toBe(1);
    });
    test('should map hypertension correctly', function () {
      var result = normalizeDiagnosis('Hypertension');
      expect(result.icdCode).toBe('I10');
      expect(result.snomedCode).toBe('38341003');
    });
    test('should map high cholesterol', function () {
      var result = normalizeDiagnosis('High Cholesterol');
      expect(result.icdCode).toBe('E78.0');
    });
    test('should provide SNOMED code', function () {
      var result = normalizeDiagnosis('Diabetes');
      expect(result.snomedCode).toBeDefined();
      expect(result.snomedDescription).toBeDefined();
    });
    test('should handle unknown diagnosis with fallback', function () {
      var result = normalizeDiagnosis('Extremely Rare Unknown Condition XYZ');
      expect(result.icdCode).toBeDefined();
      expect(result.confidence).toBeLessThan(1);
    });
    test('should handle empty string', function () {
      var result = normalizeDiagnosis('');
      expect(result.icdCode).toBeNull();
      expect(result.confidence).toBe(0);
    });
    test('should handle null input', function () {
      var result = normalizeDiagnosis(null);
      expect(result.confidence).toBe(0);
    });
    test('should fuzzy match similar terms', function () {
      var result = normalizeDiagnosis('diabtes'); // typo

      expect(result.icdCode).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
  describe('normalizeMedicines', function () {
    test('should map brand name to generic', function () {
      var result = normalizeMedicines({
        name: 'Glucophage',
        dosage: '500mg'
      });
      expect(result.genericName).toBe('Metformin');
    });
    test('should map generic name correctly', function () {
      var result = normalizeMedicines({
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily'
      });
      expect(result.genericName).toBe('Metformin');
      expect(result.brandPrice).toBeGreaterThan(0);
      expect(result.genericPrice).toBeGreaterThan(0);
      expect(result.savings).toBeGreaterThan(0);
    });
    test('should handle unknown medicine', function () {
      var result = normalizeMedicines({
        name: 'UnknownMed123'
      });
      expect(result.genericName).toBe('UnknownMed123');
      expect(result.confidence).toBeLessThan(0.5);
    });
    test('should handle null medicine', function () {
      var result = normalizeMedicines(null);
      expect(result.genericName).toBeNull();
    });
    test('should handle medicine without name', function () {
      var result = normalizeMedicines({});
      expect(result.genericName).toBeNull();
    });
    test('should calculate savings correctly', function () {
      var result = normalizeMedicines({
        name: 'Lipitor'
      });
      expect(result.savings).toBe(result.brandPrice - result.genericPrice);
    });
  });
  describe('similarity', function () {
    test('should return 1.0 for identical strings', function () {
      expect(similarity('diabetes', 'diabetes')).toBe(1.0);
    });
    test('should return 0.8 for substring match', function () {
      expect(similarity('diabetes', 'type 2 diabetes')).toBe(0.8);
    });
    test('should return low score for completely different strings', function () {
      expect(similarity('apple', 'banana')).toBeLessThan(0.5);
    });
    test('should be case insensitive', function () {
      expect(similarity('Diabetes', 'diabetes')).toBe(1.0);
    });
  });
  describe('findBestMatch', function () {
    test('should find direct match', function () {
      var dict = {
        'test': {
          code: '001'
        },
        'other': {
          code: '002'
        }
      };
      var result = findBestMatch('test', dict);
      expect(result.match.code).toBe('001');
      expect(result.confidence).toBe(1.0);
    });
    test('should return null for no match', function () {
      var dict = {
        'test': {
          code: '001'
        }
      };
      var result = findBestMatch('zzzzzzzzz', dict);
      expect(result).toBeNull();
    });
  });
});