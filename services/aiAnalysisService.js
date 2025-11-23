const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAIInstance = null;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAIInstance;
};

const getModelPriorityList = () => {
  const configuredModels = (process.env.GEMINI_MODEL_ID || '')
    .split(',')
    .map(id => id && id.trim())
    .filter(Boolean);

  const fallbackModels = (process.env.GEMINI_MODEL_FALLBACKS || '')
    .split(',')
    .map(id => id && id.trim())
    .filter(Boolean);

  const defaultModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  const priorityList = [...configuredModels, ...fallbackModels, ...defaultModels];
  return [...new Set(priorityList)];
};

const isRateLimitError = (error) => {
  if (!error) return false;
  if (error.code === 429 || Number(error.status) === 429) return true;
  if (error.status === 'RESOURCE_EXHAUSTED') return true;
  const message = error.message || '';
  return /quota|rate limit|RESOURCE_EXHAUSTED/i.test(message);
};

/**
 * Analyze resume with Gemini AI
 */
async function analyzeResumeWithAI(resumeData, jobRole, experienceLevel) {
  try {
    const aiClient = getGeminiClient();

    // Convert resume data to readable text
    const resumeText = formatResumeData(resumeData);

    const prompt = `You are an expert resume reviewer and career advisor. Analyze the following resume for the specified job role and experience level.

RESUME DATA:
${resumeText}

TARGET JOB ROLE: ${jobRole}
EXPERIENCE LEVEL: ${experienceLevel}

Provide a comprehensive analysis in the following JSON format:
{
  "score": number between 0-100 representing overall resume quality,
  "matchPercentage": number between 0-100 representing how well the resume matches the job role,
  "strengths": [
    "List 3-5 key strengths of the resume",
    "Focus on relevant skills, experience, and achievements",
    "Be specific and actionable"
  ],
  "weaknesses": [
    "List 3-5 areas that need improvement",
    "Focus on gaps in skills, experience, or presentation",
    "Be constructive and specific"
  ],
  "suggestions": [
    "Provide 4-6 actionable suggestions to improve the resume",
    "Focus on content, formatting, and missing elements",
    "Prioritize suggestions by impact"
  ],
  "advice": "A detailed paragraph of career advice tailored to this candidate's profile and target role. Include specific next steps, skill development recommendations, and strategies to bridge any gaps."
}

Analysis criteria:
1. Relevance to the ${jobRole} role
2. Appropriate for ${experienceLevel} experience level
3. Technical skills alignment
4. Professional experience quality and relevance
5. Education background
6. Project portfolio strength
7. Overall presentation and clarity
8. Missing critical elements for the role

Return ONLY valid JSON without any markdown formatting or explanation.`;

    const modelPriorityList = getModelPriorityList();
    let lastError;

    for (const modelId of modelPriorityList) {
      try {
        const model = aiClient.getGenerativeModel({ model: modelId });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        if (!text) {
          throw new Error(`Model ${modelId} returned an empty response.`);
        }

        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const analysis = JSON.parse(text);

        if (modelId !== modelPriorityList[0]) {
          console.warn(`Gemini fallback succeeded with model "${modelId}"`);
        } else {
          console.log('Successfully analyzed resume with Gemini AI');
        }

        return analysis;
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
    console.error('Error analyzing resume with Gemini AI:', error);
    throw new Error('Failed to analyze resume with AI: ' + error.message);
  }
}

/**
 * Format resume data into readable text
 */
function formatResumeData(data) {
  let text = '';

  // Personal Info
  if (data.personalInfo) {
    text += '=== PERSONAL INFORMATION ===\n';
    text += `Name: ${data.personalInfo.name}\n`;
    text += `Email: ${data.personalInfo.email}\n`;
    text += `Phone: ${data.personalInfo.phone}\n`;
    text += `Location: ${data.personalInfo.location}\n`;
    if (data.personalInfo.linkedin) text += `LinkedIn: ${data.personalInfo.linkedin}\n`;
    if (data.personalInfo.portfolio) text += `Portfolio: ${data.personalInfo.portfolio}\n`;
    text += '\n';
  }

  // Summary
  if (data.summary) {
    text += '=== PROFESSIONAL SUMMARY ===\n';
    text += `${data.summary}\n\n`;
  }

  // Education
  if (data.education && data.education.length > 0) {
    text += '=== EDUCATION ===\n';
    data.education.forEach((edu, index) => {
      text += `${index + 1}. ${edu.degree}\n`;
      text += `   ${edu.institution} (${edu.year})\n`;
      if (edu.gpa) text += `   GPA: ${edu.gpa}\n`;
      text += '\n';
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    text += '=== WORK EXPERIENCE ===\n';
    data.experience.forEach((exp, index) => {
      text += `${index + 1}. ${exp.title} at ${exp.company}\n`;
      text += `   Duration: ${exp.duration}\n`;
      text += `   ${exp.description}\n\n`;
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    text += '=== SKILLS ===\n';
    text += data.skills.join(', ') + '\n\n';
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    text += '=== PROJECTS ===\n';
    data.projects.forEach((proj, index) => {
      text += `${index + 1}. ${proj.name}\n`;
      text += `   ${proj.description}\n`;
      text += `   Technologies: ${proj.technologies}\n\n`;
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    text += '=== CERTIFICATIONS ===\n';
    data.certifications.forEach((cert, index) => {
      text += `${index + 1}. ${cert}\n`;
    });
    text += '\n';
  }

  return text;
}

module.exports = {
  analyzeResumeWithAI
};
