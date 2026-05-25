const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

async function extractResumeText(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const buffer = await fs.readFile(file.path);

  if (extension === ".pdf") {
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }

  if (extension === ".docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value || "";
  }

  return buffer.toString("utf8");
}

module.exports = { extractResumeText };

