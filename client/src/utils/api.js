const API_BASE_URL = import.meta.env.PROD
  ? "https://zensprint-zqry.vercel.app/api"
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api");
const BASE_URL = API_BASE_URL
  .trim()
  .replace(/\/+$/, "");

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("zensprint_token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("zensprint_token");
    localStorage.removeItem("zensprint_user");
    // Dispatch a custom event so App.jsx can automatically redirect to auth view
    window.dispatchEvent(new Event("zensprint-unauthorized"));
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response;
}
