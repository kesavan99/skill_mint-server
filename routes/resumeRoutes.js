const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
const resumeController = require('../controllers/resume/resumeController');
const aiAnalysisController = require('../controllers/resume/aiAnalysisController');
const authMiddleware = require('../middleware/authMiddleware');


function sanitizeFilename(originalName) {
  return originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (ext !== ".pdf") {
      return cb(new Error("File extension must be .pdf"));
    }

    if (mime !== "application/pdf") {
      return cb(new Error("Invalid PDF mime-type. Only PDF allowed."));
    }
    file.originalname = sanitizeFilename(file.originalname);

    cb(null, true);
  }
});


router.post('/upload', authMiddleware, strictLimiter, upload.single('pdf'), resumeController.uploadAndParsePDF);


// Preview HTML (for frontend preview before PDF generation)
router.post('/preview', authMiddleware, resumeController.generatePreview);

// AI Analysis endpoint
router.post('/analyze', authMiddleware, aiAnalysisController.analyzeResume);

module.exports = router;
