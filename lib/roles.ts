export const ROLES = {
  ADMIN: "ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  STUDENT: "STUDENT",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
