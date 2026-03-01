const {
  generateFHIRBundle,
  validateFHIRBundle,
  createPatientResource,
  createPractitionerResource,
  createConditionResource,
  createObservationResource,
  createMedicationRequestResource,
} = require('../src/services/generator');

describe('FHIR Generator Service', () => {
  describe('generateFHIRBundle', () => {
    const sampleInput = {
      patient: { name: 'Rohan V.', id: 'ABHA123456789' },
      doctor: { name: 'Dr. Mehta' },
      diagnosis: 'Type 2 Diabetes',
      medicines: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      ],
      labValues: [
        { parameter: 'HbA1c', value: 8.5, unit: '%' },
      ],
      icdCode: 'E11',
      snomedCode: '44054006',
    };

    test('should generate a valid FHIR Bundle', () => {
      const bundle = generateFHIRBundle(sampleInput);
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('transaction');
      expect(bundle.id).toBeDefined();
      expect(bundle.entry.length).toBeGreaterThan(0);
    });

    test('should include Patient resource', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const patient = bundle.entry.find(e => e.resource.resourceType === 'Patient');
      expect(patient).toBeDefined();
      expect(patient.resource.name[0].text).toBe('Rohan V.');
    });

    test('should include Practitioner resource', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const practitioner = bundle.entry.find(e => e.resource.resourceType === 'Practitioner');
      expect(practitioner).toBeDefined();
      expect(practitioner.resource.name[0].text).toBe('Dr. Mehta');
    });

    test('should include Condition resource with ICD-10 code', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const condition = bundle.entry.find(e => e.resource.resourceType === 'Condition');
      expect(condition).toBeDefined();
      expect(condition.resource.code.coding.some(c => c.code === 'E11')).toBe(true);
    });

    test('should include Observation resource for lab values', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const observation = bundle.entry.find(e => e.resource.resourceType === 'Observation');
      expect(observation).toBeDefined();
      expect(observation.resource.valueQuantity.value).toBe(8.5);
    });

    test('should include MedicationRequest resource', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const medRequest = bundle.entry.find(e => e.resource.resourceType === 'MedicationRequest');
      expect(medRequest).toBeDefined();
      expect(medRequest.resource.medicationCodeableConcept.text).toBe('Metformin');
    });

    test('should handle minimal input (patient only)', () => {
      const bundle = generateFHIRBundle({ patient: { name: 'Test' } });
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.entry.length).toBe(1); // Only Patient
    });

    test('should include ABHA identifier for patient', () => {
      const bundle = generateFHIRBundle(sampleInput);
      const patient = bundle.entry.find(e => e.resource.resourceType === 'Patient');
      expect(patient.resource.identifier[0].value).toBe('ABHA123456789');
    });

    test('should handle multiple diagnoses', () => {
      const input = { ...sampleInput, diagnosis: ['Diabetes', 'Hypertension'] };
      const bundle = generateFHIRBundle(input);
      const conditions = bundle.entry.filter(e => e.resource.resourceType === 'Condition');
      expect(conditions.length).toBe(2);
    });
  });

  describe('validateFHIRBundle', () => {
    test('should validate a correct bundle', () => {
      const bundle = generateFHIRBundle({ patient: { name: 'Test' } });
      const result = validateFHIRBundle(bundle);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null bundle', () => {
      const result = validateFHIRBundle(null);
      expect(result.valid).toBe(false);
    });

    test('should reject bundle without resourceType', () => {
      const result = validateFHIRBundle({ id: '123', type: 'transaction', entry: [] });
      expect(result.valid).toBe(false);
    });

    test('should reject bundle without entries', () => {
      const result = validateFHIRBundle({ resourceType: 'Bundle', id: '123', type: 'transaction', entry: [] });
      expect(result.valid).toBe(false);
    });

    test('should reject bundle without Patient', () => {
      const result = validateFHIRBundle({
        resourceType: 'Bundle',
        id: '123',
        type: 'transaction',
        entry: [{ fullUrl: 'urn:uuid:1', resource: { resourceType: 'Observation' } }],
      });
      expect(result.valid).toBe(false);
    });

    test('should report resource count', () => {
      const bundle = generateFHIRBundle({
        patient: { name: 'Test' },
        doctor: { name: 'Dr. Test' },
      });
      const result = validateFHIRBundle(bundle);
      expect(result.resourceCount).toBe(2);
      expect(result.resourceTypes).toContain('Patient');
      expect(result.resourceTypes).toContain('Practitioner');
    });
  });

  describe('Individual Resource Creators', () => {
    test('createPatientResource should create valid Patient', () => {
      const patient = createPatientResource({ name: 'John Doe' });
      expect(patient.resourceType).toBe('Patient');
      expect(patient.active).toBe(true);
      expect(patient.name[0].text).toBe('John Doe');
    });

    test('createPractitionerResource should create valid Practitioner', () => {
      const practitioner = createPractitionerResource({ name: 'Dr. Smith' });
      expect(practitioner.resourceType).toBe('Practitioner');
      expect(practitioner.name[0].text).toBe('Dr. Smith');
    });

    test('createObservationResource should handle numeric values', () => {
      const obs = createObservationResource(
        { parameter: 'HbA1c', value: 8.5, unit: '%' },
        'Patient/123'
      );
      expect(obs.valueQuantity.value).toBe(8.5);
      expect(obs.valueQuantity.unit).toBe('%');
    });

    test('createObservationResource should handle string values', () => {
      const obs = createObservationResource(
        { parameter: 'BP', value: '120/80' },
        'Patient/123'
      );
      expect(obs.valueString).toBe('120/80');
    });
  });
});
