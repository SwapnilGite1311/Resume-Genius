const axios = require("axios");

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || "http://localhost:5001";

function normalizeResult(data) {
  return {
    atsScore: data?.atsScore ?? 0,
    matchPercentage: data?.matchPercentage ?? 0,
    improvements: Array.isArray(data?.improvements) ? data.improvements : [],
    highlights: Array.isArray(data?.highlights) ? data.highlights : [],
    matchedSkills: Array.isArray(data?.matchedSkills) ? data.matchedSkills : [],
    missingSkills: Array.isArray(data?.missingSkills) ? data.missingSkills : [],
    summary: data?.summary || "",
  };
}

async function analyzeResume(resumeText, jobDescription) {
  const response = await axios.post(`${NLP_SERVICE_URL}/score`, {
    resume: resumeText,
    jobDescription,
  });

  return normalizeResult(response.data);
}

module.exports = { analyzeResume, normalizeResult };
