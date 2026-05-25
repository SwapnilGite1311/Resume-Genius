import React, { useMemo, useState } from "react";
import { CheckCircle2, Crown, FileText, Sparkles, UploadCloud, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function isAllowed(fileName) {
  return ACCEPTED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
}

export default function FileUpload({ onComplete }) {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);

  const ready = jobDescription.trim() && files.length > 0 && !isUploading;

  const totalSizeLabel = useMemo(() => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    return `${(total / 1024 / 1024).toFixed(2)} MB total`;
  }, [files]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setError("");
    setSuccess("");
    setAnalysisResults(null);

    const invalidType = selectedFiles.find((file) => !isAllowed(file.name));
    if (invalidType) {
      setError("Only PDF, DOC, DOCX, and TXT files are supported.");
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_SIZE);
    if (oversized) {
      setError("Each file must be 10 MB or smaller.");
      return;
    }

    setFiles(selectedFiles);
  };

  const removeFile = (indexToRemove) => {
    setFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setJobDescription("");
    setFiles([]);
    setProgress(0);

    const input = document.getElementById("recruiter-resume-upload");
    if (input) input.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!ready) return;

    setError("");
    setSuccess("");
    setIsUploading(true);
    setProgress(10);

    const formData = new FormData();
    files.forEach((file) => formData.append("resumes", file));
    formData.append("jobTitle", "Resume Analysis Job");
    formData.append("jobDescription", jobDescription.trim());
    formData.append("requirements", "");

    const interval = setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + 10));
    }, 220);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiter/upload-resumes-with-jd`, {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      setProgress(100);
      setSuccess(`Analyzed and ranked ${files.length} resume${files.length === 1 ? "" : "s"} successfully.`);
      setAnalysisResults(data);
      onComplete?.(data);
      resetForm();
    } catch (submitError) {
      clearInterval(interval);
      setProgress(0);
      setError(submitError.message || "Upload failed.");
    } finally {
      setIsUploading(false);
      window.setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Bulk Resume Analysis</h3>
              <p className="text-sm text-blue-100">
                Upload resumes with a job description and let the backend ingest them in one pass.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {success && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="jobDescription" className="text-sm font-semibold text-slate-800">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={6}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-inner shadow-slate-100 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Paste the role, required skills, and responsibilities here..."
            />
          </div>

          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Resume Files</p>
                <p className="text-sm text-slate-600">Up to 10 files. PDF, DOC, DOCX, or TXT. Max 10 MB each.</p>
              </div>
              <label
                htmlFor="recruiter-resume-upload"
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Choose Files
              </label>
            </div>
            <input
              id="recruiter-resume-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{totalSizeLabel}</div>
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>Processing</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!ready}>
            {isUploading ? "Analyzing resumes..." : `Analyze ${files.length || ""} Resume${files.length === 1 ? "" : "s"}`}
          </Button>
        </form>

        {analysisResults?.rankedResumes?.length ? (
          <div className="border-t border-slate-200 bg-slate-50/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ranking Results</p>
                <h4 className="mt-2 text-2xl font-semibold text-slate-950">
                  {analysisResults.summary?.topCandidate?.originalName || "Top candidate ready"}
                </h4>
                <p className="mt-2 text-sm text-slate-600">
                  {analysisResults.summary?.topCandidate
                    ? `Best fit scored ${analysisResults.summary.topCandidate.overallScore}% overall with ${analysisResults.summary.topCandidate.matchPercentage}% JD match.`
                    : "Analysis completed."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avg ATS</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{analysisResults.summary?.averageAtsScore ?? 0}%</p>
                </div>
                <div className="rounded-[20px] bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avg Match</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{analysisResults.summary?.averageMatchPercentage ?? 0}%</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {analysisResults.rankedResumes.map((resume) => (
                <div key={`${resume.filename}-${resume.rank}`} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                          {resume.rank === 1 ? <Crown className="h-3.5 w-3.5 text-amber-300" /> : null}
                          Rank #{resume.rank}
                        </span>
                        <p className="text-lg font-semibold text-slate-950">{resume.originalName}</p>
                      </div>
                      {resume.summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{resume.summary}</p> : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(resume.matchedSkills || []).slice(0, 6).map((skill) => (
                          <span key={`${resume.filename}-${skill}`} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            {skill}
                          </span>
                        ))}
                        {(resume.missingSkills || []).slice(0, 4).map((skill) => (
                          <span key={`${resume.filename}-missing-${skill}`} className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                            Missing: {skill}
                          </span>
                        ))}
                      </div>

                      {resume.highlights?.length ? (
                        <div className="mt-4 rounded-[18px] bg-slate-50 px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-semibold text-slate-900">Highlights</p>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {resume.highlights.slice(0, 3).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      <div className="rounded-[20px] bg-blue-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Overall</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{resume.overallScore}%</p>
                      </div>
                      <div className="rounded-[20px] bg-emerald-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">JD Match</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{resume.matchPercentage}%</p>
                      </div>
                      <div className="rounded-[20px] bg-violet-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">ATS</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{resume.atsScore}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
