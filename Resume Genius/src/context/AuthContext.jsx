import React, { createContext, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "auth";
const USER_STORAGE_KEY = "user";
const GUEST_STORAGE_KEY = "guestSession";

const AuthContext = createContext(null);

function getInitialGuestState() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [guestSession, setGuestSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedGuest = getInitialGuestState();

      if (savedAuth && savedUser) {
        setAuth(JSON.parse(savedAuth));
        setUser(JSON.parse(savedUser));
        setGuestSession(null);
      } else if (savedGuest) {
        setGuestSession(savedGuest);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authData) => {
    const normalizedUser = {
      name: userData?.name || userData?.email || "User",
      email: userData?.email || "",
      role: authData?.role || userData?.role || null,
    };

    const normalizedAuth = {
      token: authData?.token || null,
      role: authData?.role || userData?.role || null,
      email: normalizedUser.email,
    };

    setAuth(normalizedAuth);
    setUser(normalizedUser);
    setGuestSession(null);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedAuth));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem("role");
  };

  const logout = () => {
    setAuth(null);
    setUser(null);
    setGuestSession(null);

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem("role");
    localStorage.removeItem("rememberMe");
  };

  const continueAsGuest = (role = "recruiter") => {
    const session = { role, startedAt: new Date().toISOString() };
    setAuth(null);
    setUser(null);
    setGuestSession(session);

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem("role");
  };

  const isGuest = Boolean(guestSession);
  const isAuthenticated = Boolean(auth?.token) && !isGuest;
  const role = auth?.role || guestSession?.role || null;

  return (
    <AuthContext.Provider
      value={{
        auth,
        user,
        role,
        loading,
        isGuest,
        isAuthenticated,
        guestSession,
        login,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

