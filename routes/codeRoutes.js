const express = require('express');
const router = express.Router();
const codeController = require('../controllers/code/codeController');
const authMiddleware = require('../middleware/authMiddleware');

// Format code
router.post('/format',authMiddleware, codeController.formatCode);

// Lint code
router.post('/lint', authMiddleware, codeController.lintCode);

// Check diff
router.post('/diff', authMiddleware, codeController.checkDiff);

module.exports = router;
