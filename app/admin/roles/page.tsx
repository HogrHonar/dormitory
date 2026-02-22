import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { adminGetRoles } from "@/app/data/admin/admin-get-roles";

export default async function RolesPage() {
  await requireRole(ROLES.SUPER_ADMIN);
  const data = (await adminGetRoles()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/admin/roles/create"
        >
          Add Role
          <PlusIcon className="ml-2 h-4 w-4" />
        </Link>
        <p className="text-xl font-bold py-4">Roles Management</p>
      </div>
      <div className="container mx-auto">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
