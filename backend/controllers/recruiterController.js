const path = require("path");
const { analyzeResume } = require("../services/nlpService");
const { extractResumeText } = require("../services/resumeParser");
const { localFallbackScore } = require("../services/fallbackScoring");

function mapFile(file) {
  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    type: file.mimetype,
    storedAt: path.basename(file.path),
  };
}

function uploadResumes(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No files uploaded." });
  }

  return res.json({
    success: true,
    message: `${req.files.length} resume${req.files.length === 1 ? "" : "s"} uploaded successfully.`,
    resumes: req.files.map(mapFile),
  });
}

function rankResume(analysis) {
  return Number(((analysis.matchPercentage * 0.65) + (analysis.atsScore * 0.35)).toFixed(2));
}

async function analyzeSingleResume(file, jobDescription) {
  const resumeText = await extractResumeText(file);
  let analysis;

  try {
    analysis = await analyzeResume(resumeText, jobDescription);
  } catch {
    analysis = localFallbackScore(resumeText, jobDescription);
  }

  const overallScore = rankResume(analysis);

  return {
    ...mapFile(file),
    overallScore,
    ...analysis,
  };
}

function buildSummary(rankedResumes) {
  const totalResumes = rankedResumes.length;
  const averageAtsScore = totalResumes
    ? Number((rankedResumes.reduce((sum, resume) => sum + (resume.atsScore || 0), 0) / totalResumes).toFixed(2))
    : 0;
  const averageMatchPercentage = totalResumes
    ? Number((rankedResumes.reduce((sum, resume) => sum + (resume.matchPercentage || 0), 0) / totalResumes).toFixed(2))
    : 0;

  return {
    totalResumes,
    averageAtsScore,
    averageMatchPercentage,
    topCandidate: rankedResumes[0]
      ? {
          rank: rankedResumes[0].rank,
          originalName: rankedResumes[0].originalName,
          overallScore: rankedResumes[0].overallScore,
          atsScore: rankedResumes[0].atsScore,
          matchPercentage: rankedResumes[0].matchPercentage,
        }
      : null,
  };
}

async function uploadResumesWithJD(req, res) {
  try {
    const { jobTitle, jobDescription, requirements } = req.body;

    if (!jobDescription?.trim()) {
      return res.status(400).json({ success: false, message: "Job description is required." });
    }

    const files = req.files || [];

    let rankedResumes = [];
    if (files.length) {
      const analyzed = await Promise.all(
        files.map(async (file) => analyzeSingleResume(file, jobDescription.trim())),
      );

      rankedResumes = analyzed
        .sort((left, right) => {
          if (right.overallScore !== left.overallScore) {
            return right.overallScore - left.overallScore;
          }

          if (right.matchPercentage !== left.matchPercentage) {
            return right.matchPercentage - left.matchPercentage;
          }

          return right.atsScore - left.atsScore;
        })
        .map((resume, index) => ({
          ...resume,
          rank: index + 1,
        }));
    }

    return res.json({
      success: true,
      message: `${files.length || 0} resume${files.length === 1 ? "" : "s"} analyzed and ranked successfully.`,
      jobDescription: {
        title: jobTitle || "Resume Analysis Job",
        content: jobDescription.trim(),
        requirements: requirements || "",
      },
      resumes: files.map(mapFile),
      rankedResumes,
      summary: buildSummary(rankedResumes),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to analyze and rank resumes.",
    });
  }
}

module.exports = { uploadResumes, uploadResumesWithJD };
