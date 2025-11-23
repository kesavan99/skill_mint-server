const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  async generateResumeHTML(resumeData) {
    try {
      // Read the Handlebars template
      const templatePath = path.join(__dirname, '../templates/resume-template.hbs');
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

  async generateResumePDF(resumeData) {
    let browser = null;
    
    try {
      // Generate HTML content
      const htmlContent = await this.generateResumeHTML(resumeData);
      
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
