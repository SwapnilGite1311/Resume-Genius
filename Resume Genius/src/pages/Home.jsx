import React, { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

const featureCards = [
  {
    title: "Recruiter cockpit",
    description: "Bulk uploads, instant ingestion, and a cleaner command center for hiring teams.",
    icon: BriefcaseBusiness,
  },
  {
    title: "ATS scoring lane",
    description: "Upload a resume, compare it against a live job description, and get a structured score.",
    icon: Radar,
  },
  {
    title: "Tighter access control",
    description: "No more accidental guest access to protected routes or role leakage from stale local storage.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, role, user, continueAsGuest } = useAuth();
  const [apiState, setApiState] = useState({ status: "checking", message: "Checking backend connectivity..." });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    async function checkApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
        const data = await response.json();
        setApiState({
          status: "connected",
          message: `Backend healthy. Uptime: ${Math.round(data.uptime || 0)}s`,
        });
      } catch {
        setApiState({
          status: "disconnected",
          message: "Backend is offline or still starting. The frontend is ready either way.",
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    checkApi();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleGuestDemo = () => {
    continueAsGuest("recruiter");
    navigate("/recruiter/dashboard");
  };

  const dashboardPath = role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard";

  return (
    <main className="rg-app">
      <section className="rg-hero">
        <div className="page-shell rg-hero__inner">
          <div>
            <span className="rg-kicker">Immersive rebuild</span>
            <h1 className="rg-title">
              Make hiring software feel
              <span className="rg-title__accent">alive in depth.</span>
            </h1>
            <p className="rg-copy">
              The app now centers on cleaner routing, reliable auth boundaries, and a sharper interface for both recruiter and jobseeker flows.
            </p>

            <div className="rg-hero__actions">
              {isAuthenticated || isGuest ? (
                <button className="rg-btn rg-btn--primary" onClick={() => navigate(dashboardPath)}>
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <>
                  <button className="rg-btn rg-btn--primary" onClick={() => navigate("/register")}>
                    Start Free
                  </button>
                  <button className="rg-btn rg-btn--ghost" onClick={handleGuestDemo}>
                    Explore Recruiter Demo
                  </button>
                </>
              )}
            </div>

            <div className="rg-stats">
              <div className="rg-stat">
                <p className="rg-stat__value">5000</p>
                <p className="rg-stat__label">Unified Node API entry point</p>
              </div>
              <div className="rg-stat">
                <p className="rg-stat__value">5001</p>
                <p className="rg-stat__label">Single Python scoring service</p>
              </div>
              <div className="rg-stat">
                <p className="rg-stat__value">2</p>
                <p className="rg-stat__label">Role-specific dashboards with protected routes</p>
              </div>
            </div>
          </div>

          <div className="rg-scene">
            <div className="rg-orb rg-orb--cyan" />
            <div className="rg-orb rg-orb--blue" />
            <div className="rg-orb rg-orb--green" />

            <div className="rg-scene__stack">
              <div className="rg-float-card rg-float-card--ghost" />
              <div className="rg-float-card rg-float-card--main">
                <p className="rg-card__eyebrow">Live state</p>
                <h2 className="rg-card__title">Project readiness</h2>
                <p className="rg-card__copy">
                  Your frontend, backend, and scoring service now map into one cleaner system. The next layer is making the product feel premium and dimensional, not flat.
                </p>

                <div className="rg-meter">
                  <div className="rg-meter__row">
                    <div className="rg-meter__labels">
                      <span>Interface readiness</span>
                      <span>92%</span>
                    </div>
                    <div className="rg-meter__track">
                      <div className="rg-meter__fill" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div className="rg-meter__row">
                    <div className="rg-meter__labels">
                      <span>Backend health</span>
                      <span>{apiState.status}</span>
                    </div>
                    <div className="rg-meter__track">
                      <div
                        className="rg-meter__fill"
                        style={{ width: apiState.status === "connected" ? "88%" : "44%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rg-float-card rg-float-card--side">
                <p className="rg-card__eyebrow">Session</p>
                <p className="rg-card__copy">
                  {isAuthenticated
                    ? `Signed in as ${user?.name || user?.email || "user"} (${role}).`
                    : isGuest
                      ? "Guest demo enabled for recruiter flow only."
                      : "No session yet. Auth remains locked until the user signs in or explicitly starts a demo."}
                </p>
                <div className="rg-chip-grid">
                  <span className="rg-chip">ATS Scoring</span>
                  <span className="rg-chip">Recruiter Flow</span>
                  <span className="rg-chip">Protected Routes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell rg-sections">
        <div className="rg-panel-grid">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rg-panel">
              <div className="rg-panel__icon">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="rg-panel__title">{title}</h3>
              <p className="rg-panel__copy">{description}</p>
            </div>
          ))}
        </div>

        <div className="rg-split">
          <div className="rg-surface rg-surface--blue">
            <span className="rg-surface__eyebrow">Recruiter Flow</span>
            <h3 className="rg-surface__title">Analyze many resumes in one place</h3>
            <p className="rg-surface__copy">
              The recruiter dashboard now uses one shared upload module, cleaner stats, and a single navigation shell.
            </p>
            <div className="rg-surface__actions">
              {isAuthenticated && role === "recruiter" ? (
                <button className="rg-btn rg-btn--dark" onClick={() => navigate("/recruiter/dashboard")}>Go to Recruiter Dashboard</button>
              ) : (
                <>
                  <button className="rg-btn rg-btn--primary" onClick={handleGuestDemo}>Try Recruiter Demo</button>
                  <button className="rg-btn rg-btn--light" onClick={() => navigate("/register")}>
                    Create Recruiter Account
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rg-surface rg-surface--green">
            <span className="rg-surface__eyebrow">Jobseeker Flow</span>
            <h3 className="rg-surface__title">Score your resume against a live role</h3>
            <p className="rg-surface__copy">
              The jobseeker experience now speaks directly to the Python scorer and displays one normalized result object.
            </p>
            <div className="rg-surface__actions">
              {isAuthenticated && role === "jobseeker" ? (
                <button className="rg-btn rg-btn--dark" onClick={() => navigate("/jobseeker/dashboard")}>Open Jobseeker Dashboard</button>
              ) : (
                <>
                  <button className="rg-btn rg-btn--dark" onClick={() => navigate("/login")}>Login</button>
                  <button className="rg-btn rg-btn--light" onClick={() => navigate("/register")}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {!isAuthenticated && !isGuest && (
          <div className="rg-center-cta">
            <p className="rg-center-cta__eyebrow">Secure entry</p>
            <p className="rg-center-cta__copy">
              Public navigation no longer bypasses auth. Choose login, registration, or an explicit recruiter demo session.
            </p>
            <div className="rg-center-cta__actions">
              <Link to="/login" className="rg-btn rg-btn--dark">
                Login
              </Link>
              <Link to="/register" className="rg-btn rg-btn--primary">
                Register
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
