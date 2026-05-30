// Shared constants used across client + server.

export const UNAUTHED_ERR_MSG = "Authentication required.";
export const NOT_ADMIN_ERR_MSG = "Admin role required.";
export const NOT_FOUND_ERR_MSG = "Resource not found.";

export const ARTICLE_STATUSES = [
  "draft",
  "in_review",
  "needs_revision",
  "published",
  "rejected",
  "archived",
] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const USER_ROLES = ["user", "editor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Auth / cookies
export const COOKIE_NAME = "fu_session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
