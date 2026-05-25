import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { loading, isAuthenticated, isGuest, role } = useAuth();

  if (loading) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center">
        <div className="surface-panel px-6 py-5 text-sm text-slate-600">Preparing your dashboard...</div>
      </div>
    );
  }

  if (isAuthenticated || isGuest) {
    return <Navigate to={role === "recruiter" ? "/recruiter/dashboard" : "/jobseeker/dashboard"} replace />;
  }

  return <Navigate to="/" replace />;
}

