"use strict";

/**
 * Medical Normalization Service
 * 
 * Maps diagnoses to ICD-10 and SNOMED codes.
 * Maps brand medicines to generics.
 * Uses dictionary-based lookup with fuzzy matching fallback.
 */
// ICD-10 Code Dictionary (common conditions)
var ICD10_CODES = {
  'type 2 diabetes': {
    code: 'E11',
    description: 'Type 2 diabetes mellitus'
  },
  'diabetes': {
    code: 'E11',
    description: 'Type 2 diabetes mellitus'
  },
  'type 1 diabetes': {
    code: 'E10',
    description: 'Type 1 diabetes mellitus'
  },
  'hypertension': {
    code: 'I10',
    description: 'Essential (primary) hypertension'
  },
  'high blood pressure': {
    code: 'I10',
    description: 'Essential (primary) hypertension'
  },
  'hypercholesterolemia': {
    code: 'E78.0',
    description: 'Pure hypercholesterolemia'
  },
  'high cholesterol': {
    code: 'E78.0',
    description: 'Pure hypercholesterolemia'
  },
  'cholesterol': {
    code: 'E78.0',
    description: 'Pure hypercholesterolemia'
  },
  'asthma': {
    code: 'J45',
    description: 'Asthma'
  },
  'fever': {
    code: 'R50.9',
    description: 'Fever, unspecified'
  },
  'anemia': {
    code: 'D64.9',
    description: 'Anemia, unspecified'
  },
  'iron deficiency anemia': {
    code: 'D50',
    description: 'Iron deficiency anemia'
  },
  'vitamin d deficiency': {
    code: 'E55',
    description: 'Vitamin D deficiency'
  },
  'hypothyroidism': {
    code: 'E03.9',
    description: 'Hypothyroidism, unspecified'
  },
  'hyperthyroidism': {
    code: 'E05.9',
    description: 'Thyrotoxicosis, unspecified'
  },
  'urinary tract infection': {
    code: 'N39.0',
    description: 'Urinary tract infection, site not specified'
  },
  'pneumonia': {
    code: 'J18.9',
    description: 'Pneumonia, unspecified organism'
  },
  'migraine': {
    code: 'G43.9',
    description: 'Migraine, unspecified'
  },
  'depression': {
    code: 'F32.9',
    description: 'Major depressive disorder, single episode, unspecified'
  },
  'anxiety': {
    code: 'F41.9',
    description: 'Anxiety disorder, unspecified'
  },
  'copd': {
    code: 'J44.9',
    description: 'Chronic obstructive pulmonary disease, unspecified'
  },
  'heart failure': {
    code: 'I50.9',
    description: 'Heart failure, unspecified'
  },
  'coronary artery disease': {
    code: 'I25.1',
    description: 'Atherosclerotic heart disease'
  },
  'chronic kidney disease': {
    code: 'N18.9',
    description: 'Chronic kidney disease, unspecified'
  },
  'obesity': {
    code: 'E66.9',
    description: 'Obesity, unspecified'
  },
  'gastritis': {
    code: 'K29.7',
    description: 'Gastritis, unspecified'
  },
  'general consultation': {
    code: 'Z00.0',
    description: 'Encounter for general adult medical examination'
  },
  'infection': {
    code: 'B99.9',
    description: 'Unspecified infectious disease'
  }
}; // SNOMED CT Code Dictionary (mock)

var SNOMED_CODES = {
  'type 2 diabetes': {
    code: '44054006',
    description: 'Diabetes mellitus type 2'
  },
  'diabetes': {
    code: '44054006',
    description: 'Diabetes mellitus type 2'
  },
  'hypertension': {
    code: '38341003',
    description: 'Hypertensive disorder'
  },
  'high blood pressure': {
    code: '38341003',
    description: 'Hypertensive disorder'
  },
  'high cholesterol': {
    code: '13644009',
    description: 'Hypercholesterolemia'
  },
  'cholesterol': {
    code: '13644009',
    description: 'Hypercholesterolemia'
  },
  'asthma': {
    code: '195967001',
    description: 'Asthma'
  },
  'fever': {
    code: '386661006',
    description: 'Fever'
  },
  'anemia': {
    code: '271737000',
    description: 'Anemia'
  },
  'vitamin d deficiency': {
    code: '34713006',
    description: 'Vitamin D deficiency'
  },
  'hypothyroidism': {
    code: '40930008',
    description: 'Hypothyroidism'
  },
  'pneumonia': {
    code: '233604007',
    description: 'Pneumonia'
  },
  'migraine': {
    code: '37796009',
    description: 'Migraine'
  },
  'depression': {
    code: '35489007',
    description: 'Depressive disorder'
  },
  'anxiety': {
    code: '48694002',
    description: 'Anxiety'
  },
  'obesity': {
    code: '414916001',
    description: 'Obesity'
  },
  'general consultation': {
    code: '185349003',
    description: 'Encounter for check up'
  },
  'infection': {
    code: '40733004',
    description: 'Infectious disease'
  }
}; // Brand to Generic Medicine Mapping

var BRAND_TO_GENERIC = {
  'glucophage': {
    generic: 'Metformin',
    category: 'Anti-diabetic',
    brandPrice: 120,
    genericPrice: 35
  },
  'metformin': {
    generic: 'Metformin',
    category: 'Anti-diabetic',
    brandPrice: 120,
    genericPrice: 35
  },
  'lipitor': {
    generic: 'Atorvastatin',
    category: 'Statin',
    brandPrice: 180,
    genericPrice: 45
  },
  'atorvastatin': {
    generic: 'Atorvastatin',
    category: 'Statin',
    brandPrice: 180,
    genericPrice: 45
  },
  'norvasc': {
    generic: 'Amlodipine',
    category: 'Anti-hypertensive',
    brandPrice: 80,
    genericPrice: 20
  },
  'amlodipine': {
    generic: 'Amlodipine',
    category: 'Anti-hypertensive',
    brandPrice: 80,
    genericPrice: 20
  },
  'cozaar': {
    generic: 'Losartan',
    category: 'ARB',
    brandPrice: 150,
    genericPrice: 35
  },
  'losartan': {
    generic: 'Losartan',
    category: 'ARB',
    brandPrice: 150,
    genericPrice: 35
  },
  'ecosprin': {
    generic: 'Aspirin',
    category: 'Anti-platelet',
    brandPrice: 45,
    genericPrice: 12
  },
  'aspirin': {
    generic: 'Aspirin',
    category: 'Anti-platelet',
    brandPrice: 45,
    genericPrice: 12
  },
  'prilosec': {
    generic: 'Omeprazole',
    category: 'PPI',
    brandPrice: 95,
    genericPrice: 25
  },
  'omeprazole': {
    generic: 'Omeprazole',
    category: 'PPI',
    brandPrice: 95,
    genericPrice: 25
  },
  'augmentin': {
    generic: 'Amoxicillin + Clavulanic Acid',
    category: 'Antibiotic',
    brandPrice: 200,
    genericPrice: 55
  },
  'amoxicillin': {
    generic: 'Amoxicillin',
    category: 'Antibiotic',
    brandPrice: 120,
    genericPrice: 30
  },
  'crocin': {
    generic: 'Paracetamol',
    category: 'Analgesic',
    brandPrice: 30,
    genericPrice: 10
  },
  'paracetamol': {
    generic: 'Paracetamol',
    category: 'Analgesic',
    brandPrice: 30,
    genericPrice: 10
  },
  'plavix': {
    generic: 'Clopidogrel',
    category: 'Anti-platelet',
    brandPrice: 200,
    genericPrice: 45
  },
  'clopidogrel': {
    generic: 'Clopidogrel',
    category: 'Anti-platelet',
    brandPrice: 200,
    genericPrice: 45
  },
  'telmisartan': {
    generic: 'Telmisartan',
    category: 'ARB',
    brandPrice: 130,
    genericPrice: 30
  },
  'telma': {
    generic: 'Telmisartan',
    category: 'ARB',
    brandPrice: 130,
    genericPrice: 30
  },
  'insulin': {
    generic: 'Insulin',
    category: 'Anti-diabetic',
    brandPrice: 450,
    genericPrice: 180
  }
};
/**
 * Simple string similarity using Levenshtein distance (mock FAISS)
 */

function similarity(str1, str2) {
  var s1 = str1.toLowerCase();
  var s2 = str2.toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  var len1 = s1.length;
  var len2 = s2.length;
  var matrix = Array.from({
    length: len1 + 1
  }, function (_, i) {
    return Array.from({
      length: len2 + 1
    }, function (_, j) {
      return i === 0 ? j : j === 0 ? i : 0;
    });
  });

  for (var i = 1; i <= len1; i++) {
    for (var j = 1; j <= len2; j++) {
      var cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }

  var maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1.0 : 1.0 - matrix[len1][len2] / maxLen;
}
/**
 * Find best matching key in a dictionary using similarity
 */


function findBestMatch(term, dictionary) {
  var lowerTerm = term.toLowerCase().trim(); // Direct match

  if (dictionary[lowerTerm]) {
    return {
      match: dictionary[lowerTerm],
      confidence: 1.0,
      matchedTerm: lowerTerm
    };
  } // Similarity-based fuzzy match


  var bestMatch = null;
  var bestScore = 0;
  var bestTerm = '';

  for (var _i = 0, _Object$keys = Object.keys(dictionary); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var score = similarity(lowerTerm, key);

    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = dictionary[key];
      bestTerm = key;
    }
  }

  if (bestMatch) {
    return {
      match: bestMatch,
      confidence: Math.round(bestScore * 100) / 100,
      matchedTerm: bestTerm
    };
  }

  return null;
}
/**
 * Normalize a diagnosis string to ICD-10 and SNOMED codes
 */


function normalizeDiagnosis(diagnosis) {
  if (!diagnosis || typeof diagnosis !== 'string') {
    return {
      original: diagnosis || '',
      icdCode: null,
      snomedCode: null,
      confidence: 0
    };
  }

  var icdResult = findBestMatch(diagnosis, ICD10_CODES);
  var snomedResult = findBestMatch(diagnosis, SNOMED_CODES);
  return {
    original: diagnosis,
    icdCode: icdResult ? icdResult.match.code : 'R69',
    icdDescription: icdResult ? icdResult.match.description : 'Illness, unspecified',
    snomedCode: snomedResult ? snomedResult.match.code : '64572001',
    snomedDescription: snomedResult ? snomedResult.match.description : 'Disease',
    confidence: icdResult ? icdResult.confidence : 0.3,
    matchedTerm: icdResult ? icdResult.matchedTerm : null
  };
}
/**
 * Normalize a medicine to its generic equivalent
 */


function normalizeMedicines(medicine) {
  if (!medicine || !medicine.name) {
    return {
      original: medicine,
      genericName: null,
      brandPrice: 0,
      genericPrice: 0,
      savings: 0
    };
  }

  var result = findBestMatch(medicine.name, BRAND_TO_GENERIC);

  if (result) {
    return {
      original: medicine.name,
      genericName: result.match.generic,
      category: result.match.category,
      dosage: medicine.dosage || 'As directed',
      frequency: medicine.frequency || 'As directed',
      brandPrice: result.match.brandPrice,
      genericPrice: result.match.genericPrice,
      savings: result.match.brandPrice - result.match.genericPrice,
      confidence: result.confidence
    };
  }

  return {
    original: medicine.name,
    genericName: medicine.name,
    category: 'Unknown',
    dosage: medicine.dosage || 'As directed',
    frequency: medicine.frequency || 'As directed',
    brandPrice: 0,
    genericPrice: 0,
    savings: 0,
    confidence: 0.3
  };
}

module.exports = {
  normalizeDiagnosis: normalizeDiagnosis,
  normalizeMedicines: normalizeMedicines,
  similarity: similarity,
  findBestMatch: findBestMatch
};