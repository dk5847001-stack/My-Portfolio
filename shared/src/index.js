const viteApiUrl =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : undefined;
const nodeApiUrl =
  typeof process !== "undefined" && process.env?.VITE_API_URL
    ? process.env.VITE_API_URL
    : undefined;

export const APP_NAME = "Portfolio";
export const CLIENT_APP_NAME = "Portfolio Client";
export const ADMIN_APP_NAME = "Portfolio Admin";
export const DEFAULT_API_URL = viteApiUrl || nodeApiUrl || "http://localhost:5000/api";
export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  EDITOR: "editor",
  USER: "user",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.EDITOR]: "Editor",
  [ROLES.USER]: "User",
};

export const ROLE_ORDER = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.USER,
];
