const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

let genAIInstance = null;

const DEFAULT_MODEL_PRIORITY = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

const sanitizeModelId = (id) => id && id.trim();

const getModelPriorityList = () => {
  const configuredModels = (process.env.GEMINI_MODEL_ID)
    .split(',')
    .map(sanitizeModelId)
    .filter(Boolean);

  const fallbackModels = (process.env.GEMINI_MODEL_FALLBACKS)
    .split(',')
    .map(sanitizeModelId)
    .filter(Boolean);

  const priorityList = [...configuredModels, ...fallbackModels, ...DEFAULT_MODEL_PRIORITY];

  return [...new Set(priorityList)];
};

const isRateLimitError = (error) => {
  if (!error) {
    return false;
  }

  if (error.code === 429 || Number(error.status) === 429) {
    return true;
  }

  if (error.status === 'RESOURCE_EXHAUSTED') {
    return true;
  }

  const message = error.message || '';
  return /quota|rate limit|RESOURCE_EXHAUSTED/i.test(message);
};

const generateStructuredResume = async (model, prompt) => {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  if (!text) {
    throw new Error(`Model returned an empty response.`);
  }

  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(text);
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAIInstance;
};

/**
 * Parse resume text using Gemini AI based on the resume template schema
 * @param {string} resumeText - Extracted text from PDF
 * @returns {Promise<Object>} - Structured resume data
 */
async function parseResumeWithAI(resumeText) {
  try {
    const aiClient = getGeminiClient();

    // Read the resume template to understand the schema
    const templatePath = path.join(__dirname, '../templates/resume-template.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Create the prompt for Gemini AI
    const prompt = `You are a resume parsing AI assistant. I will provide you with text extracted from a resume PDF and a resume template that shows the expected data structure.

Your task is to:
1. Analyze the extracted resume text
2. Extract and structure the information according to the template schema
3. Return ONLY a valid JSON object with the parsed data

Resume Template Schema (for reference):
${templateContent}

Expected JSON structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "linkedin URL (optional)",
    "portfolio": "portfolio URL (optional)"
  },
  "summary": "Professional summary or objective statement",
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University name",
      "year": "Year or date range",
      "gpa": "GPA if available (optional)"
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Date range",
      "description": "Job responsibilities and achievements"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": "Technologies used"
    }
  ],
  "certifications": ["certification1", "certification2"]
}

Extracted Resume Text:
${resumeText}

Instructions:
- Extract ALL available information from the text
- If a field is not found, use empty string "" or empty array []
- For arrays, include all items found
- Ensure proper formatting of dates, names, and text
- For experience descriptions, keep them concise but informative
- Return ONLY valid JSON without any markdown formatting or explanation
- Do not include \`\`\`json or any other wrapper
`;

    const modelPriorityList = getModelPriorityList();
    let lastError;

    for (const modelId of modelPriorityList) {
      try {
        const aiClient = getGeminiClient();
        const model = aiClient.getGenerativeModel({ model: modelId });
        const parsedData = await generateStructuredResume(model, prompt);

        if (modelId !== modelPriorityList[0]) {
          console.warn(`Gemini fallback succeeded with model "${modelId}"`);
        } else {
          console.log(`Successfully parsed resume data with Gemini AI using model: ${modelId}`);
        }

        return parsedData;
      } catch (modelError) {
        lastError = modelError;

        if (isRateLimitError(modelError)) {
          console.warn(`Gemini model ${modelId} hit a rate-limit/quota issue. Trying next fallback.`);
          continue;
        }

        throw modelError;
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('Gemini model list is empty. Configure GEMINI_MODEL_ID or use defaults.');
  } catch (error) {
    console.error('Error parsing resume with Gemini AI:', error);
    throw new Error('Failed to parse resume with AI: ' + error.message);
  }
}

module.exports = {
  parseResumeWithAI
};
