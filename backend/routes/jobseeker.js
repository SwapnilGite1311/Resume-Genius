const express = require("express");
const { uploadDisk } = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard, scoreResume } = require("../controllers/jobseekerController");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Jobseeker routes are working." });
});

router.get("/dashboard", authMiddleware, getDashboard);
router.post("/score", uploadDisk.single("resume"), scoreResume);

module.exports = router;

