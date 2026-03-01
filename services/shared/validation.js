const Joi = require('joi');
const { AppError } = require('./errorHandler');

function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation error: ${messages}`, 400));
    }
    req[property] = value;
    next();
  };
}

const schemas = {
  uploadText: Joi.object({
    text: Joi.string().min(10).max(50000).required(),
    fileName: Joi.string().optional(),
    fileType: Joi.string().valid('prescription', 'lab_report', 'discharge_summary', 'other').optional(),
  }),

  recordId: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  consentUpload: Joi.object({
    recordId: Joi.string().uuid().required(),
    consents: Joi.object({
      shareWithDoctor: Joi.boolean().required(),
      shareWithInsurance: Joi.boolean().required(),
      shareWithGovernment: Joi.boolean().required(),
      researchUse: Joi.boolean().required(),
    }).required(),
  }),

  extraction: Joi.object({
    text: Joi.string().min(10).max(50000).required(),
  }),

  normalization: Joi.object({
    diagnosis: Joi.string().required(),
    medicines: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().optional(),
      frequency: Joi.string().optional(),
    })).optional(),
  }),

  fhirBundle: Joi.object({
    patient: Joi.object({
      name: Joi.string().required(),
      id: Joi.string().optional(),
    }).required(),
    doctor: Joi.object({
      name: Joi.string().required(),
    }).optional(),
    diagnosis: Joi.string().optional(),
    medicines: Joi.array().optional(),
    labValues: Joi.array().optional(),
    icdCode: Joi.string().optional(),
    snomedCode: Joi.string().optional(),
  }),

  login: Joi.object({
    mobile: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
    abhaId: Joi.string().optional(),
  }).or('mobile', 'abhaId'),

  verifyOtp: Joi.object({
    mobile: Joi.string().optional(),
    abhaId: Joi.string().optional(),
    otp: Joi.string().length(6).required(),
  }).or('mobile', 'abhaId'),
};

module.exports = { validate, schemas };
