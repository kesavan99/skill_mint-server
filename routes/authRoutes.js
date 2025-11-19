/**
 * Auth Routes
 * Defines authentication endpoints
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { loginValidation, validate } = require('../models/loginModel');

/**
 * POST /skill-mint/login
 * Login endpoint
 * Accepts JSON payload with email and password
 */
router.post('/login', loginValidation, validate, AuthController.login);

module.exports = router;
