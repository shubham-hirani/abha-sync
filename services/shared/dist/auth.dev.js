"use strict";

var jwt = require('jsonwebtoken');

var _require = require('./errorHandler'),
    AppError = _require.AppError;

var JWT_SECRET = process.env.JWT_SECRET || 'abha-sync-mvp-secret-key-2024';
var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }
}

function authMiddleware(req, _res, next) {
  var authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  var token = authHeader.split(' ')[1];

  try {
    var decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
  authMiddleware: authMiddleware
};