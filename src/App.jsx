import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import PrivateRoute from "@/components/PrivateRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import JobseekerDashboard from "@/pages/JobseekerDashboard";
import Login from "@/pages/Login";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <AppNavbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/recruiter/dashboard"
              element={
                <PrivateRoute role="recruiter" allowGuest>
                  <RecruiterDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobseeker/dashboard"
              element={
                <PrivateRoute role="jobseeker">
                  <JobseekerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
