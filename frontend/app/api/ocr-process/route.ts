import { NextRequest, NextResponse } from 'next/server';
import { MedicationRequest, Observation, Condition } from '../../../src/types/fhir';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Mock OCR processing - in real implementation, this would call the FastAPI backend
    const mockMedications: MedicationRequest[] = [
      {
        resourceType: 'MedicationRequest',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '387517004',
            display: 'Paracetamol',
          }],
          text: 'Paracetamol',
        },
        subject: {
          reference: 'Patient/example',
        },
        dosageInstruction: [{
          text: '500 mg twice daily',
          timing: {
            code: {
              coding: [{
                system: 'http://hl7.org/fhir/v3/GTSAbbreviation',
                code: 'BID',
                display: 'twice daily',
              }],
            },
          },
          doseAndRate: [{
            doseQuantity: {
              value: 500,
              unit: 'mg',
              system: 'http://unitsofmeasure.org',
              code: 'mg',
            },
          }],
        }],
        dispenseRequest: {
          quantity: {
            value: 30,
            unit: 'tablets',
          },
          expectedSupplyDuration: {
            value: 15,
            unit: 'days',
          },
        },
      },
    ];

    const mockObservations: Observation[] = [
      {
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://hl7.org/fhir/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          }],
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '2339-0',
            display: 'Glucose',
          }],
          text: 'Glucose',
        },
        subject: {
          reference: 'Patient/example',
        },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: 320,
          unit: 'mg/dL',
          system: 'http://unitsofmeasure.org',
          code: 'mg/dL',
        },
      },
    ];

    const mockConditions: Condition[] = [
      {
        resourceType: 'Condition',
        code: {
          coding: [{
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: 'R50.9',
            display: 'Fever, unspecified',
          }],
          text: 'Fever',
        },
        subject: {
          reference: 'Patient/example',
        },
        clinicalStatus: {
          coding: [{
            system: 'http://hl7.org/fhir/condition-clinical',
            code: 'active',
            display: 'Active',
          }],
        },
        verificationStatus: {
          coding: [{
            system: 'http://hl7.org/fhir/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          }],
        },
      },
    ];

    return NextResponse.json({
      medications: mockMedications,
      observations: mockObservations,
      conditions: mockConditions,
      rawText: 'Mock extracted text from OCR processing',
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}