const { analyzeResume, normalizeResult } = require("../services/nlpService");
const { extractResumeText } = require("../services/resumeParser");
const { localFallbackScore } = require("../services/fallbackScoring");

async function scoreResume(req, res) {
  try {
    const resumeFile = req.file;
    const jobDescription = req.body.jobDescription || req.body.jd;

    if (!resumeFile || !jobDescription?.trim()) {
      return res.status(400).json({ message: "Resume file and job description are required." });
    }

    const resumeText = await extractResumeText(resumeFile);

    let analysis;
    try {
      analysis = await analyzeResume(resumeText, jobDescription.trim());
    } catch {
      analysis = localFallbackScore(resumeText, jobDescription.trim());
    }

    return res.status(200).json({
      message: "Resume scored successfully.",
      filename: resumeFile.originalname,
      ...analysis,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error scoring resume." });
  }
}

function getDashboard(req, res) {
  return res.json({
    name: req.user.name,
    email: req.user.email,
    matchedJobs: 7,
    numApplications: 3,
  });
}

module.exports = { scoreResume, getDashboard };
