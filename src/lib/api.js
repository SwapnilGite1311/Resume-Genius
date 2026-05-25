function getDefaultOrigin(port) {
  if (typeof window === "undefined") {
    return `http://localhost:${port}`;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultOrigin(5000);
export const NLP_BASE_URL = import.meta.env.VITE_NLP_URL || getDefaultOrigin(5001);

export function getAuthToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export function buildAuthHeaders(token = getAuthToken()) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
