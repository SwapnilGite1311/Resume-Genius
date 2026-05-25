import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FileBadge2, FileText, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL, buildAuthHeaders, getAuthToken } from "@/lib/api";

function ResultMetric({ label, value, accent }) {
  return (
    <div className={`rounded-[24px] px-5 py-5 ${accent}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function JobseekerDashboard() {
  const fileInputRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [bannerMsg, setBannerMsg] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      const token = getAuthToken();
      if (!token) {
        setBannerMsg("You are not logged in. Resume scoring still works, but saved dashboard data is unavailable.");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobseeker/dashboard`, {
          headers: buildAuthHeaders(token),
        });
        setDashboardData(response.data);
      } catch (fetchError) {
        setBannerMsg(fetchError.response?.data?.message || "Could not load dashboard data.");
      }
    }

    fetchDashboard();
  }, []);

  const hasValidForm = useMemo(() => resumeFile && jobDescription.trim(), [resumeFile, jobDescription]);

  const handleResumeChange = (event) => {
    setResumeFile(event.target.files?.[0] || null);
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasValidForm) {
      setError("Please provide both a resume and a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription.trim());

      const token = getAuthToken();
      const headers = {
        "Content-Type": "multipart/form-data",
        ...buildAuthHeaders(token),
      };

      const response = await axios.post(`${API_BASE_URL}/api/jobseeker/score`, formData, { headers });
      setResult(response.data);
      setResumeFile(null);
      setJobDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to score this resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell py-10">
      <section className="deep-panel overflow-hidden rounded-[36px] border border-white/10 px-8 py-10 text-white">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="section-label border-white/10 bg-white/6 text-emerald-100">Jobseeker Dashboard</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              Tune your resume against a role before you send it anywhere.
            </h1>
            <p className="mt-5 max-w-2xl text-slate-300">
              One upload, one job description, one normalized result object. No duplicate state, no conflicting response shapes.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Profile snapshot</p>
            {dashboardData ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-sm text-slate-300">Signed in as</p>
                  <p className="mt-2 text-xl font-semibold">{dashboardData.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{dashboardData.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm text-slate-300">Matched Jobs</p>
                    <p className="mt-2 text-2xl font-semibold">{dashboardData.matchedJobs || 0}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm text-slate-300">Applications</p>
                    <p className="mt-2 text-2xl font-semibold">{dashboardData.numApplications || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                {bannerMsg || "Sign in to load saved profile data."}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-700">
                <FileBadge2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Resume Scoring</h2>
                <p className="text-sm text-slate-600">Upload a resume and compare it against your target job description.</p>
              </div>
            </div>

            {error && <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {bannerMsg && !dashboardData && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{bannerMsg}</div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Resume File</p>
                    <p className="text-sm text-slate-600">PDF, DOC, DOCX, or TXT. Single file per analysis.</p>
                  </div>
                  <label
                    htmlFor="jobseeker-resume-upload"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Choose Resume
                  </label>
                </div>
                <input
                  ref={fileInputRef}
                  id="jobseeker-resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleResumeChange}
                />

                <div className="mt-4 rounded-[20px] bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{resumeFile?.name || "No file selected yet"}</p>
                      <p className="text-xs text-slate-500">
                        {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : "Select a file to begin analysis."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="jobDescriptionInput" className="text-sm font-semibold text-slate-800">
                  Target Job Description
                </label>
                <textarea
                  id="jobDescriptionInput"
                  rows={7}
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setError("");
                    setResult(null);
                  }}
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  placeholder="Paste the job description here to compare against your resume..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading || !hasValidForm}>
                {loading ? "Scoring resume..." : "Submit for Scoring"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-50 text-blue-700">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Scoring Results</h2>
                <p className="text-sm text-slate-600">ATS score, match percentage, and improvement hints all live in the same response.</p>
              </div>
            </div>

            {result ? (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ResultMetric label="ATS Score" value={`${result.atsScore ?? "N/A"}%`} accent="bg-blue-50" />
                  <ResultMetric label="JD Match" value={`${result.matchPercentage ?? "N/A"}%`} accent="bg-emerald-50" />
                </div>

                {result.summary && (
                  <div className="rounded-[24px] bg-slate-950 px-5 py-5 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Analysis Summary</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{result.summary}</p>
                  </div>
                )}

                {(result.matchedSkills?.length || result.missingSkills?.length) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-emerald-50 px-5 py-5">
                      <p className="text-sm font-semibold text-emerald-900">Matched Skills</p>
                      {result.matchedSkills?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.matchedSkills.map((skill) => (
                            <span key={skill} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-emerald-800">No clear skill matches detected yet.</p>
                      )}
                    </div>

                    <div className="rounded-[24px] bg-amber-50 px-5 py-5">
                      <p className="text-sm font-semibold text-amber-900">Missing Skills</p>
                      {result.missingSkills?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.missingSkills.map((skill) => (
                            <span key={skill} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-amber-700 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-amber-800">No major missing skills were detected from the role.</p>
                      )}
                    </div>
                  </div>
                )}

                {result.highlights?.length ? (
                  <div className="rounded-[24px] bg-blue-50 px-5 py-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <p className="font-semibold text-slate-900">Highlights</p>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                      {result.highlights.map((item) => (
                        <li key={item} className="rounded-[18px] bg-white px-4 py-3 shadow-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="rounded-[24px] bg-slate-50 px-5 py-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <p className="font-semibold text-slate-900">Suggested Improvements</p>
                  </div>
                  {result.improvements?.length ? (
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                      {result.improvements.map((item) => (
                        <li key={item} className="rounded-[18px] bg-white px-4 py-3 shadow-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No improvement suggestions returned yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                Run a scoring request to see ATS results here.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
