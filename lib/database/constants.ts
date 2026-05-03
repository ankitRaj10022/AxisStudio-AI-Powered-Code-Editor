export const userRoles = ["ADMIN", "USER", "PREMIUM_USER"] as const;

export type UserRole = (typeof userRoles)[number];

export const templates = [
  "REACT",
  "NEXTJS",
  "EXPRESS",
  "VUE",
  "HONO",
  "ANGULAR",
] as const;

export type Template = (typeof templates)[number];

export const DEFAULT_USER_ROLE: UserRole = "USER";
export const DEFAULT_TEMPLATE: Template = "REACT";
