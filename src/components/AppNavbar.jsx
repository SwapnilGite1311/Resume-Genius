import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function getDashboardPath(role) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard";
}

export default function AppNavbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, role, user, logout, continueAsGuest } = useAuth();

  const isActive = (path) => pathname === path;

  const handleGuestEntry = () => {
    continueAsGuest("recruiter");
    navigate("/recruiter/dashboard");
  };

  return (
    <header className="rg-nav">
      <div className="page-shell rg-nav__inner">
        <div className="rg-nav__left">
          <Link to="/" className="rg-nav__brand">
            <div className="rg-nav__mark">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="rg-nav__title">Resume Genius</div>
              <div className="rg-nav__subtitle">Hiring intelligence platform</div>
            </div>
          </Link>

          <nav className="rg-nav__links">
            <Link
              to="/"
              className={`rg-nav__link ${isActive("/") ? "is-active" : ""}`}
            >
              Home
            </Link>
            {(isAuthenticated || isGuest) && role && (
              <Link
                to={getDashboardPath(role)}
                className={`rg-nav__link ${pathname.includes("/dashboard") ? "is-active" : ""}`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="rg-nav__right">
          {(isAuthenticated || isGuest) && (
            <div className="rg-nav__pill">
              {isGuest ? "Guest demo" : user?.name || user?.email || "Signed in"}
              <span>{role}</span>
            </div>
          )}

          {isAuthenticated ? (
            <>
              <button className="rg-btn rg-btn--light" onClick={() => navigate(getDashboardPath(role))}>
                Open Dashboard
              </button>
              <button className="rg-btn rg-btn--primary" onClick={() => { logout(); navigate("/"); }}>
                Logout
              </button>
            </>
          ) : isGuest ? (
            <>
              <button className="rg-btn rg-btn--light" onClick={() => navigate("/login")}>
                Sign In
              </button>
              <button className="rg-btn rg-btn--primary" onClick={() => navigate("/register")}>Create Account</button>
            </>
          ) : (
            <>
              <button className="rg-btn rg-btn--ghost" onClick={handleGuestEntry}>
                Explore Demo
              </button>
              <button className="rg-btn rg-btn--light" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="rg-btn rg-btn--primary" onClick={() => navigate("/register")}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
