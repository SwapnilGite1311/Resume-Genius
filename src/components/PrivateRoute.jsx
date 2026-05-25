import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function getDashboardPath(role) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard";
}

export default function PrivateRoute({ children, role, allowGuest = false }) {
  const { loading, isAuthenticated, isGuest, guestSession, auth } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center">
        <div className="surface-panel flex items-center gap-3 px-6 py-5 text-sm text-slate-600">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
          Checking access...
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isGuest) {
    if (!allowGuest) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (role && guestSession?.role !== role) {
      return <Navigate to={getDashboardPath(guestSession?.role || "recruiter")} replace />;
    }

    return <>{children}</>;
  }

  if (role && auth?.role !== role) {
    return <Navigate to={getDashboardPath(auth?.role || "jobseeker")} replace />;
  }

  return <>{children}</>;
}

