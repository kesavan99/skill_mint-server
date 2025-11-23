const { PDFParse, VerbosityLevel } = require('pdf-parse');

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
  let parser;
  try {
    console.log('PDF buffer size:', pdfBuffer.length);
    console.log('Is Buffer:', Buffer.isBuffer(pdfBuffer));
    
    parser = new PDFParse({ 
      data: pdfBuffer,
      verbosity: VerbosityLevel.ERRORS
    });

    const result = await parser.getText();

    console.log('PDF parsed successfully');
    console.log('Number of pages:', result.total ?? 'N/A');
    console.log('Text length:', result.text.length);
    
    return result.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}

module.exports = {
  extractTextFromPDF
};
