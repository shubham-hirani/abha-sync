"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/**
 * Mock AI Medical Data Extractor
 * 
 * In production, this would call an LLM (GPT-4, Med-PaLM, etc.)
 * For MVP, uses pattern matching to simulate extraction.
 */
// Common medical patterns
var DOCTOR_PATTERNS = /(?:Dr\.?\s*|Doctor\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
var DIAGNOSIS_PATTERNS = /(?:diagnosis|diagnosed with|condition|impression|assessment)[:\s]*([^\n,.]+)/gi;
var MEDICINE_PATTERNS = /(?:prescribed|medication|medicine|tablet|tab|cap|capsule)[:\s]*([^\n]+)/gi;
var DOSAGE_PATTERN = /(\d+\s*(?:mg|ml|mcg|g|units?))/gi;
var FREQUENCY_PATTERN = /(once|twice|thrice|daily|weekly|monthly|(?:\d+\s*times?\s*(?:a|per)\s*day))/gi;
var LAB_VALUE_PATTERN = /([A-Za-z\s]+)[:\s]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L|%|ng\/mL|g\/dL|U\/L|mIU\/L|mmHg|cells\/μL)/gi;
var PATIENT_PATTERN = /(?:patient|name|Mr\.|Mrs\.|Ms\.)[:\s]*(?:Mr\.|Mrs\.|Ms\.)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g;
var HOSPITAL_PATTERN = /(?:hospital|clinic|medical center|healthcare)[:\s]*([^\n,]+)/gi;
var DATE_PATTERN = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g; // Known medicine dictionary for mock extraction

var KNOWN_MEDICINES = {
  metformin: {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    category: 'Anti-diabetic'
  },
  atorvastatin: {
    name: 'Atorvastatin',
    dosage: '10mg',
    frequency: 'Once daily',
    category: 'Statin'
  },
  amlodipine: {
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    category: 'Anti-hypertensive'
  },
  aspirin: {
    name: 'Aspirin',
    dosage: '75mg',
    frequency: 'Once daily',
    category: 'Anti-platelet'
  },
  omeprazole: {
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily',
    category: 'PPI'
  },
  amoxicillin: {
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Thrice daily',
    category: 'Antibiotic'
  },
  paracetamol: {
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'As needed',
    category: 'Analgesic'
  },
  losartan: {
    name: 'Losartan',
    dosage: '50mg',
    frequency: 'Once daily',
    category: 'ARB'
  },
  insulin: {
    name: 'Insulin',
    dosage: '10 units',
    frequency: 'Before meals',
    category: 'Anti-diabetic'
  },
  clopidogrel: {
    name: 'Clopidogrel',
    dosage: '75mg',
    frequency: 'Once daily',
    category: 'Anti-platelet'
  }
};

function extractPatient(text) {
  var matches = _toConsumableArray(text.matchAll(PATIENT_PATTERN));

  if (matches.length > 0) {
    return {
      name: matches[0][1].trim()
    };
  }

  return {
    name: 'Unknown Patient'
  };
}

function extractDoctor(text) {
  var matches = _toConsumableArray(text.matchAll(DOCTOR_PATTERNS));

  if (matches.length > 0) {
    return {
      name: "Dr. ".concat(matches[0][1].trim())
    };
  }

  return {
    name: 'Unknown Doctor'
  };
}

function extractDiagnosis(text) {
  var matches = _toConsumableArray(text.matchAll(DIAGNOSIS_PATTERNS));

  if (matches.length > 0) {
    return matches.map(function (m) {
      return m[1].trim();
    });
  } // Fallback: look for common conditions


  var conditions = ['diabetes', 'hypertension', 'cholesterol', 'asthma', 'fever', 'infection', 'anemia'];
  var found = conditions.filter(function (c) {
    return text.toLowerCase().includes(c);
  });
  return found.length > 0 ? found.map(function (f) {
    return f.charAt(0).toUpperCase() + f.slice(1);
  }) : ['General Consultation'];
}

function extractMedicines(text) {
  var medicines = [];
  var lowerText = text.toLowerCase(); // Check for known medicines in text

  for (var _i = 0, _Object$entries = Object.entries(KNOWN_MEDICINES); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        medicine = _Object$entries$_i[1];

    if (lowerText.includes(key)) {
      medicines.push(_objectSpread({}, medicine));
    }
  } // Also try pattern-based extraction


  var medMatches = _toConsumableArray(text.matchAll(MEDICINE_PATTERNS));

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var match = _step.value;
      var medLine = match[1].trim();
      var dosageMatch = medLine.match(DOSAGE_PATTERN);
      var freqMatch = medLine.match(FREQUENCY_PATTERN);
      var medName = medLine.split(/\s+/)[0];

      if (medName && !medicines.find(function (m) {
        return m.name.toLowerCase() === medName.toLowerCase();
      })) {
        medicines.push({
          name: medName,
          dosage: dosageMatch ? dosageMatch[0] : 'As directed',
          frequency: freqMatch ? freqMatch[0] : 'As directed',
          category: 'General'
        });
      }
    };

    for (var _iterator = medMatches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return medicines.length > 0 ? medicines : [{
    name: 'None identified',
    dosage: '-',
    frequency: '-',
    category: '-'
  }];
}

function extractLabValues(text) {
  var labValues = [];

  var matches = _toConsumableArray(text.matchAll(LAB_VALUE_PATTERN));

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = matches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var match = _step2.value;
      labValues.push({
        parameter: match[1].trim(),
        value: parseFloat(match[2]),
        unit: match[3]
      });
    } // Check for common lab values by name

  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var commonLabs = {
    'hba1c': {
      parameter: 'HbA1c',
      normalRange: '< 7.0%',
      unit: '%'
    },
    'blood sugar': {
      parameter: 'Blood Sugar',
      normalRange: '70-100 mg/dL',
      unit: 'mg/dL'
    },
    'cholesterol': {
      parameter: 'Cholesterol',
      normalRange: '< 200 mg/dL',
      unit: 'mg/dL'
    },
    'hemoglobin': {
      parameter: 'Hemoglobin',
      normalRange: '13-17 g/dL',
      unit: 'g/dL'
    },
    'creatinine': {
      parameter: 'Creatinine',
      normalRange: '0.7-1.3 mg/dL',
      unit: 'mg/dL'
    },
    'vitamin d': {
      parameter: 'Vitamin D',
      normalRange: '30-100 ng/mL',
      unit: 'ng/mL'
    }
  };
  var lowerText = text.toLowerCase();

  var _loop2 = function _loop2() {
    var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        key = _Object$entries2$_i[0],
        lab = _Object$entries2$_i[1];

    if (lowerText.includes(key) && !labValues.find(function (l) {
      return l.parameter.toLowerCase() === key;
    })) {
      var valueMatch = new RegExp("".concat(key, "[:\\s]*(\\d+\\.?\\d*)"), 'i').exec(text);

      if (valueMatch) {
        labValues.push(_objectSpread({}, lab, {
          value: parseFloat(valueMatch[1])
        }));
      }
    }
  };

  for (var _i2 = 0, _Object$entries2 = Object.entries(commonLabs); _i2 < _Object$entries2.length; _i2++) {
    _loop2();
  }

  return labValues;
}

function calculateConfidence(extracted) {
  var score = 0.5; // Base confidence for any extraction

  if (extracted.patient.name !== 'Unknown Patient') score += 0.1;
  if (extracted.doctor.name !== 'Unknown Doctor') score += 0.1;
  if (extracted.diagnosis.length > 0 && extracted.diagnosis[0] !== 'General Consultation') score += 0.1;
  if (extracted.medicines.length > 0 && extracted.medicines[0].name !== 'None identified') score += 0.1;
  if (extracted.labValues.length > 0) score += 0.1;
  return Math.min(score, 1.0);
}

function extractMedicalData(text) {
  if (!text || typeof text !== 'string') {
    return {
      patient: {
        name: 'Unknown Patient'
      },
      doctor: {
        name: 'Unknown Doctor'
      },
      diagnosis: [],
      medicines: [],
      labValues: [],
      confidenceScore: 0,
      extractedAt: new Date().toISOString()
    };
  }

  var patient = extractPatient(text);
  var doctor = extractDoctor(text);
  var diagnosis = extractDiagnosis(text);
  var medicines = extractMedicines(text);
  var labValues = extractLabValues(text);
  var extracted = {
    patient: patient,
    doctor: doctor,
    diagnosis: diagnosis,
    medicines: medicines,
    labValues: labValues
  };
  var confidenceScore = calculateConfidence(extracted);
  return _objectSpread({}, extracted, {
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    extractedAt: new Date().toISOString()
  });
}

module.exports = {
  extractMedicalData: extractMedicalData
};