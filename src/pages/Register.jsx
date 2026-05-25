import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

function getDashboardPath(role) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard";
}

export default function Register() {
  const navigate = useNavigate();
  const { login, continueAsGuest } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "jobseeker",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const { token, user } = response.data;
      setSuccess("Account created successfully.");

      if (token && user) {
        login(user, { token, role: user.role, email: user.email });
        navigate(getDashboardPath(user.role), { replace: true });
        return;
      }

      navigate("/login");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Registration failed.");
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
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">New account</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Create your Resume Genius account</h1>
              <p className="mt-3 text-sm text-slate-600">
                Want a quick walkthrough instead?{" "}
                <button type="button" onClick={handleGuestMode} className="font-semibold text-blue-700 transition hover:text-blue-800">
                  Continue as recruiter guest
                </button>
              </p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-800">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
                  <label htmlFor="role" className="text-sm font-semibold text-slate-800">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="jobseeker">Jobseeker</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" size="lg" className="w-full" onClick={handleGuestMode}>
                Continue as Guest
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="deep-panel rounded-[32px] border border-white/10 p-8 text-white">
          <span className="section-label border-white/10 bg-white/6 text-blue-100">Role-based setup</span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">Register once, land on the right dashboard immediately.</h2>
          <p className="mt-4 text-slate-300">
            Account role now lives in auth state instead of being copied into multiple local storage keys and UI components.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">Cleaner onboarding</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Registration auto-signs users into the correct dashboard whenever the API returns a token.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Consistent styling</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">No more invisible links or white text on white buttons. The forms now use the shared UI system end to end.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

