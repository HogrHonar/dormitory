import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";

export const getUserPermissions = cache(async () => {
  const user = await getCurrentUser();
  return new Set(user?.role?.permissions.map((rp) => rp.permission.name) ?? []);
});

export async function hasPermission(permission: string) {
  const perms = await getUserPermissions();
  return perms.has(permission);
}

// ✅ Add this — use in page components and server actions
export async function requirePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allowed = await hasPermission(permission);
  if (!allowed) redirect("/unauthorized");
}

// ✅ Add this — use when any one of multiple permissions is enough
export async function requireAnyPermission(...permissions: string[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const perms = await getUserPermissions();
  const allowed = permissions.some((p) => perms.has(p));
  if (!allowed) redirect("/unauthorized");
}
