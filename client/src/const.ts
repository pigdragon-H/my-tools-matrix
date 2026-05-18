export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Returns the login page URL with optional returnTo parameter
export const getLoginUrl = (returnTo?: string) => {
  const base = "/login";
  if (returnTo) {
    return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return base;
};
