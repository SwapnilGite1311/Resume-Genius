const { normalizeResult } = require("./nlpService");

const STOPWORDS = new Set([
  "about",
  "across",
  "also",
  "and",
  "build",
  "built",
  "can",
  "deliver",
  "delivered",
  "experience",
  "for",
  "from",
  "have",
  "into",
  "looking",
  "need",
  "needs",
  "role",
  "strong",
  "team",
  "that",
  "their",
  "this",
  "using",
  "with",
  "work",
  "worked",
  "your",
]);

function extractKeywords(text) {
  return Array.from(new Set(text.toLowerCase().match(/\b[a-z][a-z0-9.+/-]*\b/g) || [])).filter(
    (word) => word.length > 2 && !STOPWORDS.has(word),
  );
}

function localFallbackScore(resumeText, jobDescription) {
  const resumeWords = new Set(extractKeywords(resumeText));
  const jdWords = extractKeywords(jobDescription);
  const matched = jdWords.filter((word) => resumeWords.has(word));
  const matchPercentage = jdWords.length ? Math.round((matched.length / jdWords.length) * 100) : 0;
  const atsScore = Math.max(45, Math.min(98, 55 + Math.round(matched.length * 2.4)));
  const missing = jdWords.filter((word) => !resumeWords.has(word)).slice(0, 4);

  return normalizeResult({
    atsScore,
    matchPercentage,
    highlights: matched.slice(0, 5).map((word) => `Matched keyword: ${word}`),
    matchedSkills: matched.slice(0, 8),
    missingSkills: missing,
    summary:
      matchPercentage >= 70
        ? "Strong overlap with the target role based on the uploaded text."
        : "Moderate overlap found, but the resume likely needs stronger alignment with the role.",
    improvements: missing.length
      ? [`Consider adding evidence for: ${missing.join(", ")}`]
      : ["Resume already covers the main keywords from this role."],
  });
}

module.exports = { localFallbackScore };
