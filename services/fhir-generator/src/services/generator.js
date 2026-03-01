/**
 * FHIR R4 Bundle Generator
 * 
 * Generates FHIR R4-compliant JSON bundles from extracted medical data.
 * Based on HL7 FHIR R4 specification (4.0.1).
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a FHIR-compliant Patient resource
 */
function createPatientResource(patient) {
  return {
    resourceType: 'Patient',
    id: uuidv4(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    active: true,
    name: [
      {
        use: 'official',
        text: patient.name || 'Unknown Patient',
        family: (patient.name || 'Unknown').split(' ').pop(),
        given: (patient.name || 'Unknown').split(' ').slice(0, -1),
      },
    ],
    identifier: patient.id
      ? [{ system: 'https://healthid.ndhm.gov.in', value: patient.id }]
      : [],
  };
}

/**
 * Generate a FHIR-compliant Practitioner resource
 */
function createPractitionerResource(doctor) {
  return {
    resourceType: 'Practitioner',
    id: uuidv4(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Practitioner'],
    },
    active: true,
    name: [
      {
        use: 'official',
        text: doctor.name || 'Unknown Doctor',
        family: (doctor.name || 'Unknown').split(' ').pop(),
        given: (doctor.name || 'Unknown').split(' ').slice(0, -1),
      },
    ],
  };
}

/**
 * Generate a FHIR-compliant Condition resource
 */
function createConditionResource(diagnosis, patientRef, icdCode, snomedCode) {
  const coding = [];
  if (icdCode) {
    coding.push({
      system: 'http://hl7.org/fhir/sid/icd-10',
      code: icdCode,
      display: diagnosis,
    });
  }
  if (snomedCode) {
    coding.push({
      system: 'http://snomed.info/sct',
      code: snomedCode,
      display: diagnosis,
    });
  }

  return {
    resourceType: 'Condition',
    id: uuidv4(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Condition'],
    },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
    },
    code: {
      coding: coding.length > 0 ? coding : [{ display: diagnosis }],
      text: diagnosis,
    },
    subject: { reference: patientRef },
    recordedDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Generate FHIR-compliant Observation resources for lab values
 */
function createObservationResource(labValue, patientRef) {
  const observation = {
    resourceType: 'Observation',
    id: uuidv4(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      text: labValue.parameter || labValue.name || 'Unknown Test',
    },
    subject: { reference: patientRef },
    effectiveDateTime: new Date().toISOString(),
  };

  if (typeof labValue.value === 'number') {
    observation.valueQuantity = {
      value: labValue.value,
      unit: labValue.unit || '',
      system: 'http://unitsofmeasure.org',
    };
  } else if (typeof labValue.value === 'string') {
    observation.valueString = labValue.value;
  }

  return observation;
}

/**
 * Generate FHIR-compliant MedicationRequest resource
 */
function createMedicationRequestResource(medicine, patientRef, practitionerRef) {
  return {
    resourceType: 'MedicationRequest',
    id: uuidv4(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/MedicationRequest'],
    },
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: medicine.name || medicine.genericName || 'Unknown Medicine',
    },
    subject: { reference: patientRef },
    requester: practitionerRef ? { reference: practitionerRef } : undefined,
    dosageInstruction: [
      {
        text: `${medicine.dosage || ''} ${medicine.frequency || ''}`.trim() || 'As directed',
        timing: {
          code: {
            text: medicine.frequency || 'As directed',
          },
        },
        doseAndRate: medicine.dosage
          ? [
              {
                doseQuantity: {
                  value: parseInt(medicine.dosage) || 0,
                  unit: medicine.dosage.replace(/\d+/g, '').trim() || 'mg',
                },
              },
            ]
          : undefined,
      },
    ],
  };
}

/**
 * Generate a complete FHIR R4 Bundle
 */
function generateFHIRBundle(data) {
  const bundleId = uuidv4();
  const entries = [];

  // Patient resource
  const patient = createPatientResource(data.patient || { name: 'Unknown' });
  const patientRef = `Patient/${patient.id}`;
  entries.push({
    fullUrl: `urn:uuid:${patient.id}`,
    resource: patient,
    request: { method: 'POST', url: 'Patient' },
  });

  // Practitioner resource
  let practitionerRef = null;
  if (data.doctor) {
    const practitioner = createPractitionerResource(data.doctor);
    practitionerRef = `Practitioner/${practitioner.id}`;
    entries.push({
      fullUrl: `urn:uuid:${practitioner.id}`,
      resource: practitioner,
      request: { method: 'POST', url: 'Practitioner' },
    });
  }

  // Condition resource(s)
  if (data.diagnosis) {
    const diagnoses = Array.isArray(data.diagnosis) ? data.diagnosis : [data.diagnosis];
    for (const diag of diagnoses) {
      const condition = createConditionResource(diag, patientRef, data.icdCode, data.snomedCode);
      entries.push({
        fullUrl: `urn:uuid:${condition.id}`,
        resource: condition,
        request: { method: 'POST', url: 'Condition' },
      });
    }
  }

  // Observation resources (lab values)
  if (data.labValues && Array.isArray(data.labValues)) {
    for (const lab of data.labValues) {
      const observation = createObservationResource(lab, patientRef);
      entries.push({
        fullUrl: `urn:uuid:${observation.id}`,
        resource: observation,
        request: { method: 'POST', url: 'Observation' },
      });
    }
  }

  // MedicationRequest resources
  if (data.medicines && Array.isArray(data.medicines)) {
    for (const medicine of data.medicines) {
      const medRequest = createMedicationRequestResource(medicine, patientRef, practitionerRef);
      entries.push({
        fullUrl: `urn:uuid:${medRequest.id}`,
        resource: medRequest,
        request: { method: 'POST', url: 'MedicationRequest' },
      });
    }
  }

  return {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    type: 'transaction',
    entry: entries,
  };
}

/**
 * Validate FHIR Bundle structure
 */
function validateFHIRBundle(bundle) {
  const errors = [];

  if (!bundle) {
    return { valid: false, errors: ['Bundle is null or undefined'] };
  }

  if (bundle.resourceType !== 'Bundle') {
    errors.push('Missing or invalid resourceType (expected "Bundle")');
  }

  if (!bundle.id) {
    errors.push('Missing bundle id');
  }

  if (!bundle.type) {
    errors.push('Missing bundle type');
  }

  if (!bundle.entry || !Array.isArray(bundle.entry) || bundle.entry.length === 0) {
    errors.push('Bundle must contain at least one entry');
  } else {
    // Validate each entry
    const hasPatient = bundle.entry.some((e) => e.resource?.resourceType === 'Patient');
    if (!hasPatient) {
      errors.push('Bundle must contain at least one Patient resource');
    }

    for (let i = 0; i < bundle.entry.length; i++) {
      const entry = bundle.entry[i];
      if (!entry.resource) {
        errors.push(`Entry ${i}: missing resource`);
      }
      if (!entry.resource?.resourceType) {
        errors.push(`Entry ${i}: missing resourceType`);
      }
      if (!entry.fullUrl) {
        errors.push(`Entry ${i}: missing fullUrl`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    resourceCount: bundle.entry?.length || 0,
    resourceTypes: [...new Set(bundle.entry?.map((e) => e.resource?.resourceType) || [])],
  };
}

module.exports = {
  generateFHIRBundle,
  validateFHIRBundle,
  createPatientResource,
  createPractitionerResource,
  createConditionResource,
  createObservationResource,
  createMedicationRequestResource,
};
