"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require('./errorHandler'),
    AppError = _require.AppError;
/**
 * Simple in-memory rate limiter middleware
 */


function rateLimiter() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$windowMs = _ref.windowMs,
      windowMs = _ref$windowMs === void 0 ? 60000 : _ref$windowMs,
      _ref$maxRequests = _ref.maxRequests,
      maxRequests = _ref$maxRequests === void 0 ? 100 : _ref$maxRequests;

  var requests = new Map(); // Cleanup old entries every minute

  setInterval(function () {
    var now = Date.now();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = requests.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            data = _step$value[1];

        if (now - data.windowStart > windowMs) {
          requests["delete"](key);
        }
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
  }, windowMs);
  return function (req, _res, next) {
    var key = req.ip || req.connection.remoteAddress || 'unknown';
    var now = Date.now();
    var record = requests.get(key);

    if (!record || now - record.windowStart > windowMs) {
      requests.set(key, {
        windowStart: now,
        count: 1
      });
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      return next(new AppError('Too many requests, please try again later', 429));
    }

    next();
  };
}

module.exports = {
  rateLimiter: rateLimiter
};