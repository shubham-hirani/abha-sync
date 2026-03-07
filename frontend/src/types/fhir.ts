// FHIR R4 Resource Types for ABHA-Sync

export interface MedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      code?: {
        coding?: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }>;
  }>;
  dispenseRequest?: {
    quantity?: {
      value: number;
      unit: string;
    };
    expectedSupplyDuration?: {
      value: number;
      unit: string;
    };
  };
}

export interface Observation {
  resourceType: 'Observation';
  id?: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: {
      value: number;
      unit: string;
    };
    high?: {
      value: number;
      unit: string;
    };
    text?: string;
  }>;
}

export interface Patient {
  resourceType: 'Patient';
  id?: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    text?: string;
  }>;
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface Condition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  severity?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}