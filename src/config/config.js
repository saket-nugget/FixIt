export const CONFIG = {
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD1QR5Vd30bORUnL_3qPCHswB8vktw3i-I", // Fallback for safety, but env preferred
  MODEL_NAME: import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview",
};
