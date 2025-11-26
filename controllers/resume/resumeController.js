const pdfService = require('../../services/pdfService');
const pdfParserService = require('../../services/pdfParserService');
const geminiService = require('../../services/geminiService');

exports.uploadAndParsePDF = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please upload a PDF file' 
      });
    }

    // Check if it's a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only PDF files are allowed' 
      });
    }

    console.log('Processing uploaded PDF:', req.file.originalname);

    // Step 1: Extract text from PDF
    const extractedText = await pdfParserService.extractTextFromPDF(req.file.buffer);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Empty PDF',
        message: 'Could not extract text from the PDF. Please try a different file.' 
      });
    }

    console.log('Extracted text length:', extractedText.length);

    // Step 2: Parse with Gemini AI
    const parsedResumeData = await geminiService.parseResumeWithAI(extractedText);

    console.log('Successfully parsed resume data');

    // Return the structured data
    res.json(parsedResumeData);
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF',
      message: error.message 
    });
  }
};


exports.generatePreview = async (req, res) => {
  try {
    const { template = 'resume-template', ...resumeData } = req.body;
    
    console.log('Received template:', template);
    console.log('Resume data keys:', Object.keys(resumeData));
    
    // Validate required fields
    if (!resumeData.personalInfo || !resumeData.personalInfo.name) {
      return res.status(400).json({ 
        error: 'Invalid resume data',
        message: 'Personal info with name is required' 
      });
    }

    // Generate HTML preview with selected template
    const htmlContent = await pdfService.generateResumeHTML(resumeData, template);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ 
      error: 'Failed to generate preview',
      message: error.message 
    });
  }
};
