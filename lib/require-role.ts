import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";
import { Role } from "./roles";

export async function requireRole(role: Role) {
  const user = await getCurrentUser();

  if (!user) redirect("/login"); // not logged in
  if (user.role?.name !== role) redirect("/unauthorized"); // wrong role

  return user;
}
