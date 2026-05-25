import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LockKeyhole, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password/${token}`, formData);
      setSuccess(response.data.message || "Password reset successful. You can sign in now.");
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="deep-panel rounded-[32px] border border-white/10 p-8 text-white">
          <span className="section-label border-white/10 bg-white/6 text-blue-100">Reset Password</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Choose a new password and get back into your workspace.</h1>
          <p className="mt-4 max-w-lg text-slate-300">
            Use a strong password you have not used elsewhere. Once this is saved, the recovery link is invalidated.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">One-time recovery token</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Reset links expire after 30 minutes and cannot be reused after a successful password change.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Protected credential update</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Passwords are hashed before storage and never sent back to the client.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Create a new password</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Reset your password</h2>
              <p className="mt-3 text-sm text-slate-600">Use at least 6 characters for this release.</p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your new password"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Re-enter your new password"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Updating password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-8">
              <Link to="/login" className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
