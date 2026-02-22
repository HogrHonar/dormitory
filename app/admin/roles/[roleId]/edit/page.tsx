import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { RoleForm } from "../../_components/role-form";
import { adminGetRoleById } from "@/app/data/admin/admin-get-roles";
import { notFound } from "next/navigation";

export default async function EditRolePage({
  params,
}: {
  params: { roleId: string };
}) {
  await requireRole(ROLES.SUPER_ADMIN);
  const role = await adminGetRoleById(params.roleId);
  if (!role) notFound();

  return (
    <section className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Role</h1>
        <p className="text-muted-foreground">Update role details.</p>
      </div>
      <RoleForm
        defaultValues={{
          id: role.id,
          name: role.name,
          description: role.description ?? undefined,
        }}
      />
    </section>
  );
}
