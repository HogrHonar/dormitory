import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { RoleForm } from "../_components/role-form";

export default async function CreateRolePage() {
  await requireRole(ROLES.SUPER_ADMIN);

  return (
    <section className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Role</h1>
        <p className="text-muted-foreground">Add a new role to the system.</p>
      </div>
      <RoleForm />
    </section>
  );
}
