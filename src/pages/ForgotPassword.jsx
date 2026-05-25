import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
      });

      setMessage(response.data.message || "If an account exists for that email, password reset instructions have been sent.");
      setResetUrl(response.data.resetUrl || "");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to start password recovery.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="deep-panel rounded-[32px] border border-white/10 p-8 text-white">
          <span className="section-label border-white/10 bg-white/6 text-blue-100">Password Recovery</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Request a secure reset link for your account.</h1>
          <p className="mt-4 max-w-lg text-slate-300">
            Enter the email on your Resume Genius account and we will route you into a password reset flow.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <MailCheck className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">Single recovery lane</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Reset links expire automatically and are removed once the password is changed.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Email-first delivery</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Production deployments can route this through SMTP without exposing reset tokens in the UI.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Forgot password</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Send a reset link</h2>
              <p className="mt-3 text-sm text-slate-600">We will only send instructions if the account exists.</p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {message && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="name@company.com"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>

            {resetUrl ? (
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Local testing link</p>
                <a href={resetUrl} className="mt-2 block break-all text-sm text-blue-700 hover:text-blue-800">
                  {resetUrl}
                </a>
              </div>
            ) : null}

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
