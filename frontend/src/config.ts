/**
 * Application Configuration
 * 
 * Central place for environment variables and configuration constants.
 */

// Use VITE_API_URL if defined, otherwise fall back to localhost (useful for local dev without .env)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Add other config values here as needed
