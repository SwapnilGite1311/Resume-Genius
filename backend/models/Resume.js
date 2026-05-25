const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    filepath: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "JobDescription", default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Resume", resumeSchema);

