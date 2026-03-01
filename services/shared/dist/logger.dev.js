"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var winston = require('winston');

var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }), winston.format.errors({
    stack: true
  }), winston.format.json()),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown'
  },
  transports: [new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.printf(function (_ref) {
      var timestamp = _ref.timestamp,
          level = _ref.level,
          message = _ref.message,
          service = _ref.service,
          meta = _objectWithoutProperties(_ref, ["timestamp", "level", "message", "service"]);

      var metaStr = Object.keys(meta).length ? " ".concat(JSON.stringify(meta)) : '';
      return "".concat(timestamp, " [").concat(service, "] ").concat(level, ": ").concat(message).concat(metaStr);
    }))
  })]
});
module.exports = logger;