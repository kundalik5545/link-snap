/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_BASE_URL from environment variables
 * Falls back to localhost in development
 */
export function getBaseUrl(): string {
  // Priority: NEXT_PUBLIC_BASE_URL > NEXT_PUBLIC_APP_URL > localhost
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // Remove trailing slash if present
  return baseUrl.replace(/\/$/, "");
}
