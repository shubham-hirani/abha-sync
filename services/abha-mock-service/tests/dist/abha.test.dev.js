"use strict";

var request = require('supertest');

var app = require('../src/index'); // Set test environment


process.env.NODE_ENV = 'test';
describe('ABHA Mock Service', function () {
  describe('Health Check', function () {
    test('GET /health should return healthy', function _callee() {
      var res;
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/health'));

            case 2:
              res = _context.sent;
              expect(res.status).toBe(200);
              expect(res.body.service).toBe('abha-mock-service');

            case 5:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  });
  describe('POST /mock-abha/upload', function () {
    var validPayload = {
      fhirBundle: {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [{
          resource: {
            resourceType: 'Patient'
          }
        }]
      },
      consents: {
        shareWithDoctor: true,
        shareWithInsurance: false,
        shareWithGovernment: true,
        researchUse: false
      },
      patientAbhaId: 'ABHA123456789'
    };
    test('should accept valid upload with consent', function _callee2() {
      var res;
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/upload').send(validPayload));

            case 2:
              res = _context2.sent;
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(res.body.data.status).toBe('ACCEPTED');
              expect(res.body.data.transactionId).toBeDefined();
              expect(res.body.data.responseToken).toBeDefined();

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      });
    });
    test('should reject upload without FHIR bundle', function _callee3() {
      var res;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/upload').send({
                consents: validPayload.consents
              }));

            case 2:
              res = _context3.sent;
              expect(res.status).toBe(400);
              expect(res.body.success).toBe(false);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
    test('should reject upload without consent', function _callee4() {
      var res;
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/upload').send({
                fhirBundle: validPayload.fhirBundle
              }));

            case 2:
              res = _context4.sent;
              expect(res.status).toBe(400);

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
    test('should reject upload with no valid consent flags', function _callee5() {
      var res;
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/upload').send({
                fhirBundle: validPayload.fhirBundle,
                consents: {
                  shareWithDoctor: false,
                  shareWithInsurance: false,
                  shareWithGovernment: false,
                  researchUse: false
                }
              }));

            case 2:
              res = _context5.sent;
              expect(res.status).toBe(403);

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      });
    });
    test('should record consent flags in response', function _callee6() {
      var res;
      return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/upload').send(validPayload));

            case 2:
              res = _context6.sent;
              expect(res.body.data.consentsRecorded.shareWithDoctor).toBe(true);
              expect(res.body.data.consentsRecorded.shareWithGovernment).toBe(true);

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      });
    });
  });
  describe('GET /mock-abha/status/:transactionId', function () {
    test('should return transaction status', function _callee7() {
      var res;
      return regeneratorRuntime.async(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/mock-abha/status/ABHA-TXN-123'));

            case 2:
              res = _context7.sent;
              expect(res.status).toBe(200);
              expect(res.body.data.status).toBe('COMPLETED');

            case 5:
            case "end":
              return _context7.stop();
          }
        }
      });
    });
  });
  describe('POST /mock-abha/verify', function () {
    test('should verify valid ABHA ID', function _callee8() {
      var res;
      return regeneratorRuntime.async(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/verify').send({
                abhaId: 'ABHA123456789'
              }));

            case 2:
              res = _context8.sent;
              expect(res.status).toBe(200);
              expect(res.body.data.verified).toBe(true);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      });
    });
    test('should reject invalid ABHA ID', function _callee9() {
      var res;
      return regeneratorRuntime.async(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/verify').send({
                abhaId: 'INVALID'
              }));

            case 2:
              res = _context9.sent;
              expect(res.status).toBe(200);
              expect(res.body.data.verified).toBe(false);

            case 5:
            case "end":
              return _context9.stop();
          }
        }
      });
    });
    test('should reject missing ABHA ID', function _callee10() {
      var res;
      return regeneratorRuntime.async(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/mock-abha/verify').send({}));

            case 2:
              res = _context10.sent;
              expect(res.status).toBe(400);

            case 4:
            case "end":
              return _context10.stop();
          }
        }
      });
    });
  });
});