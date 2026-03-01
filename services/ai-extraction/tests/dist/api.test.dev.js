"use strict";

var request = require('supertest');

var app = require('../src/index');

describe('AI Extraction API', function () {
  test('GET /health should return healthy status', function _callee() {
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
            expect(res.body.status).toBe('healthy');
            expect(res.body.service).toBe('ai-extraction');

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  test('POST /extract should extract data from valid text', function _callee2() {
    var res;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/extract').send({
              text: 'Patient: Mr. Rohan. Dr. Mehta. Diagnosis: Diabetes. Prescribed metformin 500mg.'
            }));

          case 2:
            res = _context2.sent;
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('patient');
            expect(res.body.data).toHaveProperty('doctor');
            expect(res.body.data).toHaveProperty('diagnosis');
            expect(res.body.data).toHaveProperty('medicines');
            expect(res.body.data).toHaveProperty('confidenceScore');

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  test('POST /extract should reject empty text', function _callee3() {
    var res;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/extract').send({
              text: ''
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
  test('POST /extract should reject missing text field', function _callee4() {
    var res;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/extract').send({}));

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
  test('POST /extract should reject short text', function _callee5() {
    var res;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/extract').send({
              text: 'short'
            }));

          case 2:
            res = _context5.sent;
            expect(res.status).toBe(400);

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
});