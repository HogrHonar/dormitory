import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import {
  adminGetAllRoles,
  adminGetRoleById,
} from "@/app/data/admin/admin-get-roles";
import { adminGetAllPermissions } from "@/app/data/admin/admin-get-permissions";
import { notFound } from "next/navigation";
import { PermissionsManager } from "../../_components/permissions-manager";

export default async function RolePermissionsPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;

  await requireRole(ROLES.SUPER_ADMIN);

  const [role, allRoles, allPermissions] = await Promise.all([
    adminGetRoleById(roleId),
    adminGetAllRoles(),
    adminGetAllPermissions(),
  ]);

  if (!role) notFound();

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Permissions</h1>
        <p className="text-muted-foreground">
          Assign permissions to roles across all resource categories.
        </p>
      </div>
      <PermissionsManager
        currentRole={role}
        allRoles={allRoles}
        allPermissions={allPermissions}
      />
    </section>
  );
}
