import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

function getDashboardPath(role) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedState = localStorage.getItem("rememberMe") === "true";

    if (rememberedEmail) {
      setFormData((current) => ({ ...current, email: rememberedEmail }));
      setRememberMe(rememberedState);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      const { token, user } = response.data;

      login(user, { token, role: user.role, email: user.email });

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", user.email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      const redirectPath = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest("recruiter");
    navigate("/recruiter/dashboard");
  };

  return (
    <main className="page-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="deep-panel rounded-[32px] border border-white/10 p-8 text-white">
          <span className="section-label border-white/10 bg-white/6 text-blue-100">Secure Access</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Log back in and continue where you left off.</h1>
          <p className="mt-4 max-w-lg text-slate-300">
            Auth state now loads safely before route checks, so users no longer drift into guest mode by default.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">Protected route fix</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Role enforcement happens after auth resolution, not from stale local storage reads.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Explicit guest demo</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Guest mode is now opt-in and limited to the recruiter demo route.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Sign in to Resume Genius</h2>
              <p className="mt-3 text-sm text-slate-600">
                Need a quick look?{" "}
                <button type="button" onClick={handleGuestMode} className="font-semibold text-blue-700 transition hover:text-blue-800">
                  Continue as recruiter guest
                </button>
              </p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember email on this device
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" size="lg" className="w-full" onClick={handleGuestMode}>
                Continue as Guest
              </Button>
              <Link to="/register" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
