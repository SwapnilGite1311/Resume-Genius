const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, default: "Resume Analysis Job" },
    content: { type: String, required: true },
    requirements: { type: String, default: "" },
    sourceType: { type: String, default: "form" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);

