import React, { useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, FolderKanban, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const activities = [
  "Candidate shortlist refreshed for Senior Frontend Engineer.",
  "Two resumes uploaded to the Product Designer pipeline.",
  "New JD drafted for Full Stack Developer.",
  "AI screening batch completed for Marketing Analyst.",
];

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { isGuest, user, logout } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const stats = useMemo(
    () =>
      latestAnalysis?.summary
        ? {
            totalJobs: isGuest ? 5 : 12,
            activeJobs: isGuest ? 3 : 8,
            applications: latestAnalysis.summary.totalResumes,
            shortlistRate: `${Math.round(latestAnalysis.summary.averageMatchPercentage || 0)}%`,
          }
        : isGuest
        ? {
            totalJobs: 5,
            activeJobs: 3,
            applications: 26,
            shortlistRate: "41%",
          }
        : {
            totalJobs: 12,
            activeJobs: 8,
            applications: 156,
            shortlistRate: "58%",
          },
    [isGuest, latestAnalysis],
  );

  return (
    <main className="page-shell py-10">
      <section className="deep-panel overflow-hidden rounded-[36px] border border-white/10 px-8 py-10 text-white">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="section-label border-white/10 bg-white/6 text-blue-100">Recruiter Dashboard</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              Screen resumes with a calmer workflow and a sharper view of your pipeline.
            </h1>
            <p className="mt-5 max-w-2xl text-slate-300">
              {isGuest
                ? "You are in recruiter demo mode. Uploads still work, but account features remain locked until sign-in."
                : `Welcome back${user?.name ? `, ${user.name}` : ""}. Your workspace is ready for bulk analysis.`}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isGuest ? (
                <>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/register")}>Create Account</Button>
                </>
              ) : (
                <Button variant="danger" onClick={logout}>
                  Logout
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Current focus</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-sm text-slate-300">Upload readiness</p>
                <p className="mt-2 text-2xl font-semibold">Bulk ingestion active</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-sm text-slate-300">Demo policy</p>
                <p className="mt-2 text-sm text-slate-200">Guests can explore the recruiter flow only after explicitly starting the demo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total jobs" value={stats.totalJobs} accent="bg-blue-50 text-blue-700" icon={BriefcaseBusiness} />
        <StatCard label="Active jobs" value={stats.activeJobs} accent="bg-emerald-50 text-emerald-700" icon={FolderKanban} />
        <StatCard label="Applications" value={stats.applications} accent="bg-amber-50 text-amber-700" icon={Users} />
        <StatCard label="Shortlist rate" value={stats.shortlistRate} accent="bg-slate-100 text-slate-800" icon={BarChart3} />
      </section>

      {isGuest && (
        <section className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Guest demo</p>
          <p className="mt-2 text-sm">
            This session is intentionally scoped. Protected recruiter data stays locked until you authenticate.
          </p>
        </section>
      )}

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <FileUpload onComplete={setLatestAnalysis} />

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Actions</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-[24px] bg-blue-50 px-5 py-4 text-slate-900">
                  <p className="font-semibold">Post new job</p>
                  <p className="mt-1 text-sm text-slate-600">Create a fresh hiring lane and attach resumes later.</p>
                </div>
                <div className="rounded-[24px] bg-emerald-50 px-5 py-4 text-slate-900">
                  <p className="font-semibold">Review applicants</p>
                  <p className="mt-1 text-sm text-slate-600">Inspect uploaded resumes and shortlist stronger matches.</p>
                </div>
                <div className="rounded-[24px] bg-slate-100 px-5 py-4 text-slate-900">
                  <p className="font-semibold">Manage jobs</p>
                  <p className="mt-1 text-sm text-slate-600">Update role details without leaving the dashboard shell.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent Activity</p>
              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <div key={activity} className="flex gap-3 rounded-[22px] bg-slate-50 px-4 py-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">{activity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
