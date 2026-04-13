export const CONFIG = {
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  MODEL_NAME: import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash",
  BACKEND_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
};
