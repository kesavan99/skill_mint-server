const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  async generateResumeHTML(resumeData, templateName = 'resume-template') {
    try {
      console.log('PDFService - Generating HTML with template:', templateName);
      
      // Validate template name to prevent path traversal
      const validTemplates = [
        'resume-template',
        'resume-template-minimalist',
        'resume-template-two-column',
        'resume-template-executive',
        'resume-template-skills-first',
        'resume-template-creative'
      ];

      const selectedTemplate = validTemplates.includes(templateName) 
        ? templateName 
        : 'resume-template';

      console.log('PDFService - Using template:', selectedTemplate);

      // Read the selected Handlebars template
      const templatePath = path.join(__dirname, `../templates/${selectedTemplate}.hbs`);
      console.log('PDFService - Template path:', templatePath);
      
      const templateSource = await fs.readFile(templatePath, 'utf-8');
      
      // Compile the template
      const template = handlebars.compile(templateSource);
      
      // Generate HTML with data
      const html = template(resumeData);
      
      return html;
    } catch (error) {
      console.error('Error generating HTML:', error);
      throw new Error('Failed to generate HTML preview');
    }
  }

  async generateResumePDF(resumeData, templateName = 'resume-template') {
    let browser = null;
    
    try {
      // Generate HTML content with selected template
      const htmlContent = await this.generateResumeHTML(resumeData, templateName);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set the HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = new PDFService();
