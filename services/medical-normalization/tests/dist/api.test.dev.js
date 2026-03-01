"use strict";

var request = require('supertest');

var app = require('../src/index');

describe('Medical Normalization API', function () {
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
            expect(res.body.service).toBe('medical-normalization');

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  test('POST /normalize should normalize diagnosis and medicines', function _callee2() {
    var res;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/normalize').send({
              diagnosis: 'Type 2 Diabetes',
              medicines: [{
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily'
              }, {
                name: 'Atorvastatin',
                dosage: '10mg'
              }]
            }));

          case 2:
            res = _context2.sent;
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.diagnosis.icdCode).toBe('E11');
            expect(res.body.data.medicines).toHaveLength(2);
            expect(res.body.data.medicines[0].genericName).toBe('Metformin');

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
  test('POST /normalize should reject missing diagnosis', function _callee3() {
    var res;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/normalize').send({}));

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
  test('POST /normalize should handle diagnosis without medicines', function _callee4() {
    var res;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(request(app).post('/normalize').send({
              diagnosis: 'Hypertension'
            }));

          case 2:
            res = _context4.sent;
            expect(res.status).toBe(200);
            expect(res.body.data.diagnosis.icdCode).toBe('I10');
            expect(res.body.data.medicines).toHaveLength(0);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
});