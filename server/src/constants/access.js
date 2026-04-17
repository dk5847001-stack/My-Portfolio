import { ROLES } from "@portfolio/shared";

export const viewerRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.USER,
];

export const editorRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR];
export const adminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
export const superAdminRoles = [ROLES.SUPER_ADMIN];
