"use strict";

var request = require('supertest');

var app = require('../src/index');

describe('FHIR Generator API', function () {
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
            expect(res.body.service).toBe('fhir-generator');

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  test('POST /generate should generate FHIR bundle', function _callee2() {
    var res;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/generate').send({
              patient: {
                name: 'Rohan V.'
              },
              doctor: {
                name: 'Dr. Mehta'
              },
              diagnosis: 'Diabetes',
              medicines: [{
                name: 'Metformin',
                dosage: '500mg'
              }],
              labValues: [{
                parameter: 'HbA1c',
                value: 8.5,
                unit: '%'
              }]
            }));

          case 2:
            res = _context2.sent;
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.bundle.resourceType).toBe('Bundle');
            expect(res.body.data.validation.valid).toBe(true);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  test('POST /generate should reject missing patient', function _callee3() {
    var res;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/generate').send({
              diagnosis: 'Diabetes'
            }));

          case 2:
            res = _context3.sent;
            expect(res.status).toBe(400);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
  test('POST /generate should handle minimal input', function _callee4() {
    var res;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/generate').send({
              patient: {
                name: 'Test Patient'
              }
            }));

          case 2:
            res = _context4.sent;
            expect(res.status).toBe(200);
            expect(res.body.data.bundle.entry.length).toBeGreaterThan(0);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
});