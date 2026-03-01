const { normalizeDiagnosis, normalizeMedicines, similarity, findBestMatch } = require('../src/services/normalizer');

describe('Medical Normalization Service', () => {
  describe('normalizeDiagnosis', () => {
    test('should map known diagnosis to ICD-10 code', () => {
      const result = normalizeDiagnosis('Type 2 Diabetes');
      expect(result.icdCode).toBe('E11');
      expect(result.confidence).toBe(1);
    });

    test('should map hypertension correctly', () => {
      const result = normalizeDiagnosis('Hypertension');
      expect(result.icdCode).toBe('I10');
      expect(result.snomedCode).toBe('38341003');
    });

    test('should map high cholesterol', () => {
      const result = normalizeDiagnosis('High Cholesterol');
      expect(result.icdCode).toBe('E78.0');
    });

    test('should provide SNOMED code', () => {
      const result = normalizeDiagnosis('Diabetes');
      expect(result.snomedCode).toBeDefined();
      expect(result.snomedDescription).toBeDefined();
    });

    test('should handle unknown diagnosis with fallback', () => {
      const result = normalizeDiagnosis('Extremely Rare Unknown Condition XYZ');
      expect(result.icdCode).toBeDefined();
      expect(result.confidence).toBeLessThan(1);
    });

    test('should handle empty string', () => {
      const result = normalizeDiagnosis('');
      expect(result.icdCode).toBeNull();
      expect(result.confidence).toBe(0);
    });

    test('should handle null input', () => {
      const result = normalizeDiagnosis(null);
      expect(result.confidence).toBe(0);
    });

    test('should fuzzy match similar terms', () => {
      const result = normalizeDiagnosis('diabtes'); // typo
      expect(result.icdCode).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('normalizeMedicines', () => {
    test('should map brand name to generic', () => {
      const result = normalizeMedicines({ name: 'Glucophage', dosage: '500mg' });
      expect(result.genericName).toBe('Metformin');
    });

    test('should map generic name correctly', () => {
      const result = normalizeMedicines({ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' });
      expect(result.genericName).toBe('Metformin');
      expect(result.brandPrice).toBeGreaterThan(0);
      expect(result.genericPrice).toBeGreaterThan(0);
      expect(result.savings).toBeGreaterThan(0);
    });

    test('should handle unknown medicine', () => {
      const result = normalizeMedicines({ name: 'UnknownMed123' });
      expect(result.genericName).toBe('UnknownMed123');
      expect(result.confidence).toBeLessThan(0.5);
    });

    test('should handle null medicine', () => {
      const result = normalizeMedicines(null);
      expect(result.genericName).toBeNull();
    });

    test('should handle medicine without name', () => {
      const result = normalizeMedicines({});
      expect(result.genericName).toBeNull();
    });

    test('should calculate savings correctly', () => {
      const result = normalizeMedicines({ name: 'Lipitor' });
      expect(result.savings).toBe(result.brandPrice - result.genericPrice);
    });
  });

  describe('similarity', () => {
    test('should return 1.0 for identical strings', () => {
      expect(similarity('diabetes', 'diabetes')).toBe(1.0);
    });

    test('should return 0.8 for substring match', () => {
      expect(similarity('diabetes', 'type 2 diabetes')).toBe(0.8);
    });

    test('should return low score for completely different strings', () => {
      expect(similarity('apple', 'banana')).toBeLessThan(0.5);
    });

    test('should be case insensitive', () => {
      expect(similarity('Diabetes', 'diabetes')).toBe(1.0);
    });
  });

  describe('findBestMatch', () => {
    test('should find direct match', () => {
      const dict = { 'test': { code: '001' }, 'other': { code: '002' } };
      const result = findBestMatch('test', dict);
      expect(result.match.code).toBe('001');
      expect(result.confidence).toBe(1.0);
    });

    test('should return null for no match', () => {
      const dict = { 'test': { code: '001' } };
      const result = findBestMatch('zzzzzzzzz', dict);
      expect(result).toBeNull();
    });
  });
});
