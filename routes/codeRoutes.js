const express = require('express');
const router = express.Router();
const codeController = require('../controllers/code/codeController');

// Format code
router.post('/format', codeController.formatCode);

// Lint code
router.post('/lint', codeController.lintCode);

// Check diff
router.post('/diff', codeController.checkDiff);

module.exports = router;
