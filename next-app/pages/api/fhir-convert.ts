// Mock FHIR conversion endpoint
export default function handler(req: any, res: any) {
  // Expect a document (base64 or file ref) and return a FHIR-like JSON
  const sample = {
    resourceType: 'Bundle',
    entry: [
      { resource: { resourceType: 'MedicationStatement', medicationCodeableConcept: { text: 'Paracetamol 500 mg' } } },
      { resource: { resourceType: 'Condition', code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'R50.9' }] } } }
    ]
  }
  res.status(200).json(sample)
}
