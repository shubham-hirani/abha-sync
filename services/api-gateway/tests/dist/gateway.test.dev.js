"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var request = require('supertest'); // Mock the database before importing app


jest.mock('@abha-sync/shared', function () {
  var actual = jest.requireActual('@abha-sync/shared');

  var Database = require('better-sqlite3');

  var db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON'); // Create tables  

  db.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      mobile TEXT UNIQUE,\n      abha_id TEXT UNIQUE,\n      email TEXT,\n      created_at TEXT DEFAULT (datetime('now')),\n      updated_at TEXT DEFAULT (datetime('now'))\n    );\n    CREATE TABLE IF NOT EXISTS records (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      file_name TEXT,\n      file_type TEXT DEFAULT 'other',\n      raw_text TEXT,\n      extracted_data TEXT,\n      normalized_data TEXT,\n      confidence_score REAL DEFAULT 0,\n      status TEXT DEFAULT 'pending',\n      created_at TEXT DEFAULT (datetime('now')),\n      updated_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id)\n    );\n    CREATE TABLE IF NOT EXISTS fhir_bundles (\n      id TEXT PRIMARY KEY,\n      record_id TEXT UNIQUE,\n      bundle_json TEXT NOT NULL,\n      version TEXT DEFAULT '4.0.1',\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (record_id) REFERENCES records(id)\n    );\n    CREATE TABLE IF NOT EXISTS reminders (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      medication TEXT NOT NULL,\n      dosage TEXT,\n      frequency TEXT,\n      time TEXT,\n      enabled INTEGER DEFAULT 1,\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id)\n    );\n    CREATE TABLE IF NOT EXISTS consent_logs (\n      id TEXT PRIMARY KEY,\n      user_id TEXT,\n      record_id TEXT,\n      share_with_doctor INTEGER DEFAULT 0,\n      share_with_insurance INTEGER DEFAULT 0,\n      share_with_government INTEGER DEFAULT 0,\n      research_use INTEGER DEFAULT 0,\n      abha_upload_status TEXT DEFAULT 'pending',\n      abha_response_token TEXT,\n      created_at TEXT DEFAULT (datetime('now')),\n      FOREIGN KEY (user_id) REFERENCES users(id),\n      FOREIGN KEY (record_id) REFERENCES records(id)\n    );\n  "); // Seed user

  db.prepare("INSERT OR IGNORE INTO users (id, name, mobile, abha_id, email) VALUES (?, ?, ?, ?, ?)").run('default-user', 'Rohan V.', '+919876543210', 'ABHA123456789', 'rohan@example.com');
  return _objectSpread({}, actual, {
    getDb: function getDb() {
      return db;
    },
    initializeDatabase: function initializeDatabase() {
      return db;
    },
    closeDatabase: function closeDatabase() {}
  });
});

var app = require('../src/index');

describe('API Gateway', function () {
  describe('Health Check', function () {
    test('GET /api/health should return healthy', function _callee() {
      var res;
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/api/health'));

            case 2:
              res = _context.sent;
              expect(res.status).toBe(200);
              expect(res.body.service).toBe('api-gateway');

            case 5:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  });
  describe('Auth', function () {
    test('POST /api/auth/send-otp should accept valid mobile', function _callee2() {
      var res;
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/api/auth/send-otp').send({
                mobile: '+919876543210'
              }));

            case 2:
              res = _context2.sent;
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      });
    });
    test('POST /api/auth/verify-otp should return token for valid OTP', function _callee3() {
      var res;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/api/auth/send-otp').send({
                mobile: '+919876543210'
              }));

            case 2:
              _context3.next = 4;
              return regeneratorRuntime.awrap(request(app).post('/api/auth/verify-otp').send({
                mobile: '+919876543210',
                otp: '123456'
              }));

            case 4:
              res = _context3.sent;
              expect(res.status).toBe(200);
              expect(res.body.data.token).toBeDefined();
              expect(res.body.data.user).toBeDefined();

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
    test('POST /api/auth/verify-otp should reject invalid OTP', function _callee4() {
      var res;
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/api/auth/send-otp').send({
                mobile: '+919876543210'
              }));

            case 2:
              _context4.next = 4;
              return regeneratorRuntime.awrap(request(app).post('/api/auth/verify-otp').send({
                mobile: '+919876543210',
                otp: '000000'
              }));

            case 4:
              res = _context4.sent;
              expect(res.status).toBe(401);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
  });
  describe('Records', function () {
    test('GET /api/records should return records list', function _callee5() {
      var res;
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/api/records'));

            case 2:
              res = _context5.sent;
              expect(res.status).toBe(200);
              expect(res.body.success).toBe(true);
              expect(Array.isArray(res.body.data.records)).toBe(true);

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      });
    });
    test('GET /api/records/:id should return 404 for non-existent record', function _callee6() {
      var res;
      return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/api/records/non-existent-id'));

            case 2:
              res = _context6.sent;
              expect(res.status).toBe(404);

            case 4:
            case "end":
              return _context6.stop();
          }
        }
      });
    });
  });
  describe('Reminders', function () {
    var reminderId;
    test('POST /api/reminders should create a reminder', function _callee7() {
      var res;
      return regeneratorRuntime.async(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(request(app).post('/api/reminders').send({
                medication: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                time: '09:00'
              }));

            case 2:
              res = _context7.sent;
              expect(res.status).toBe(201);
              expect(res.body.data.id).toBeDefined();
              reminderId = res.body.data.id;

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      });
    });
    test('GET /api/reminders should return reminders', function _callee8() {
      var res;
      return regeneratorRuntime.async(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(request(app).get('/api/reminders'));

            case 2:
              res = _context8.sent;
              expect(res.status).toBe(200);
              expect(Array.isArray(res.body.data.reminders)).toBe(true);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      });
    });
    test('PUT /api/reminders/:id should update reminder', function _callee9() {
      var res;
      return regeneratorRuntime.async(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              if (reminderId) {
                _context9.next = 2;
                break;
              }

              return _context9.abrupt("return");

            case 2:
              _context9.next = 4;
              return regeneratorRuntime.awrap(request(app).put("/api/reminders/".concat(reminderId)).send({
                enabled: false
              }));

            case 4:
              res = _context9.sent;
              expect(res.status).toBe(200);

            case 6:
            case "end":
              return _context9.stop();
          }
        }
      });
    });
    test('DELETE /api/reminders/:id should delete reminder', function _callee10() {
      var res;
      return regeneratorRuntime.async(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (reminderId) {
                _context10.next = 2;
                break;
              }

              return _context10.abrupt("return");

            case 2:
              _context10.next = 4;
              return regeneratorRuntime.awrap(request(app)["delete"]("/api/reminders/".concat(reminderId)));

            case 4:
              res = _context10.sent;
              expect(res.status).toBe(200);

            case 6:
            case "end":
              return _context10.stop();
          }
        }
      });
    });
    test('DELETE /api/reminders/:id should 404 for non-existent', function _callee11() {
      var res;
      return regeneratorRuntime.async(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(request(app)["delete"]('/api/reminders/fake-id'));

            case 2:
              res = _context11.sent;
              expect(res.status).toBe(404);

            case 4:
            case "end":
              return _context11.stop();
          }
        }
      });
    });
  });
});