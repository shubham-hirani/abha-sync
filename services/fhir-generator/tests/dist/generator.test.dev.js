"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('../src/services/generator'),
    generateFHIRBundle = _require.generateFHIRBundle,
    validateFHIRBundle = _require.validateFHIRBundle,
    createPatientResource = _require.createPatientResource,
    createPractitionerResource = _require.createPractitionerResource,
    createConditionResource = _require.createConditionResource,
    createObservationResource = _require.createObservationResource,
    createMedicationRequestResource = _require.createMedicationRequestResource;

describe('FHIR Generator Service', function () {
  describe('generateFHIRBundle', function () {
    var sampleInput = {
      patient: {
        name: 'Rohan V.',
        id: 'ABHA123456789'
      },
      doctor: {
        name: 'Dr. Mehta'
      },
      diagnosis: 'Type 2 Diabetes',
      medicines: [{
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily'
      }],
      labValues: [{
        parameter: 'HbA1c',
        value: 8.5,
        unit: '%'
      }],
      icdCode: 'E11',
      snomedCode: '44054006'
    };
    test('should generate a valid FHIR Bundle', function () {
      var bundle = generateFHIRBundle(sampleInput);
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('transaction');
      expect(bundle.id).toBeDefined();
      expect(bundle.entry.length).toBeGreaterThan(0);
    });
    test('should include Patient resource', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var patient = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'Patient';
      });
      expect(patient).toBeDefined();
      expect(patient.resource.name[0].text).toBe('Rohan V.');
    });
    test('should include Practitioner resource', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var practitioner = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'Practitioner';
      });
      expect(practitioner).toBeDefined();
      expect(practitioner.resource.name[0].text).toBe('Dr. Mehta');
    });
    test('should include Condition resource with ICD-10 code', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var condition = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'Condition';
      });
      expect(condition).toBeDefined();
      expect(condition.resource.code.coding.some(function (c) {
        return c.code === 'E11';
      })).toBe(true);
    });
    test('should include Observation resource for lab values', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var observation = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'Observation';
      });
      expect(observation).toBeDefined();
      expect(observation.resource.valueQuantity.value).toBe(8.5);
    });
    test('should include MedicationRequest resource', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var medRequest = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'MedicationRequest';
      });
      expect(medRequest).toBeDefined();
      expect(medRequest.resource.medicationCodeableConcept.text).toBe('Metformin');
    });
    test('should handle minimal input (patient only)', function () {
      var bundle = generateFHIRBundle({
        patient: {
          name: 'Test'
        }
      });
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.entry.length).toBe(1); // Only Patient
    });
    test('should include ABHA identifier for patient', function () {
      var bundle = generateFHIRBundle(sampleInput);
      var patient = bundle.entry.find(function (e) {
        return e.resource.resourceType === 'Patient';
      });
      expect(patient.resource.identifier[0].value).toBe('ABHA123456789');
    });
    test('should handle multiple diagnoses', function () {
      var input = _objectSpread({}, sampleInput, {
        diagnosis: ['Diabetes', 'Hypertension']
      });

      var bundle = generateFHIRBundle(input);
      var conditions = bundle.entry.filter(function (e) {
        return e.resource.resourceType === 'Condition';
      });
      expect(conditions.length).toBe(2);
    });
  });
  describe('validateFHIRBundle', function () {
    test('should validate a correct bundle', function () {
      var bundle = generateFHIRBundle({
        patient: {
          name: 'Test'
        }
      });
      var result = validateFHIRBundle(bundle);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    test('should reject null bundle', function () {
      var result = validateFHIRBundle(null);
      expect(result.valid).toBe(false);
    });
    test('should reject bundle without resourceType', function () {
      var result = validateFHIRBundle({
        id: '123',
        type: 'transaction',
        entry: []
      });
      expect(result.valid).toBe(false);
    });
    test('should reject bundle without entries', function () {
      var result = validateFHIRBundle({
        resourceType: 'Bundle',
        id: '123',
        type: 'transaction',
        entry: []
      });
      expect(result.valid).toBe(false);
    });
    test('should reject bundle without Patient', function () {
      var result = validateFHIRBundle({
        resourceType: 'Bundle',
        id: '123',
        type: 'transaction',
        entry: [{
          fullUrl: 'urn:uuid:1',
          resource: {
            resourceType: 'Observation'
          }
        }]
      });
      expect(result.valid).toBe(false);
    });
    test('should report resource count', function () {
      var bundle = generateFHIRBundle({
        patient: {
          name: 'Test'
        },
        doctor: {
          name: 'Dr. Test'
        }
      });
      var result = validateFHIRBundle(bundle);
      expect(result.resourceCount).toBe(2);
      expect(result.resourceTypes).toContain('Patient');
      expect(result.resourceTypes).toContain('Practitioner');
    });
  });
  describe('Individual Resource Creators', function () {
    test('createPatientResource should create valid Patient', function () {
      var patient = createPatientResource({
        name: 'John Doe'
      });
      expect(patient.resourceType).toBe('Patient');
      expect(patient.active).toBe(true);
      expect(patient.name[0].text).toBe('John Doe');
    });
    test('createPractitionerResource should create valid Practitioner', function () {
      var practitioner = createPractitionerResource({
        name: 'Dr. Smith'
      });
      expect(practitioner.resourceType).toBe('Practitioner');
      expect(practitioner.name[0].text).toBe('Dr. Smith');
    });
    test('createObservationResource should handle numeric values', function () {
      var obs = createObservationResource({
        parameter: 'HbA1c',
        value: 8.5,
        unit: '%'
      }, 'Patient/123');
      expect(obs.valueQuantity.value).toBe(8.5);
      expect(obs.valueQuantity.unit).toBe('%');
    });
    test('createObservationResource should handle string values', function () {
      var obs = createObservationResource({
        parameter: 'BP',
        value: '120/80'
      }, 'Patient/123');
      expect(obs.valueString).toBe('120/80');
    });
  });
});