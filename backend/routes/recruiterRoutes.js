const express = require("express");
const { uploadDisk } = require("../middleware/upload");
const { uploadResumes, uploadResumesWithJD } = require("../controllers/recruiterController");

const router = express.Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Recruiter routes are working.",
    timestamp: new Date().toISOString(),
  });
});

router.post("/upload-resumes", uploadDisk.array("resumes", 10), uploadResumes);
router.post("/upload-resumes-with-jd", uploadDisk.array("resumes", 10), uploadResumesWithJD);

module.exports = router;

