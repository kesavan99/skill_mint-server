const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resume/resumeController');
const aiAnalysisController = require('../controllers/resume/aiAnalysisController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload and parse PDF resume
router.post('/upload', authMiddleware, upload.single('pdf'), resumeController.uploadAndParsePDF);


// Preview HTML (for frontend preview before PDF generation)
router.post('/preview', authMiddleware, resumeController.generatePreview);

// AI Analysis endpoint
router.post('/analyze', authMiddleware, aiAnalysisController.analyzeResume);

module.exports = router;
