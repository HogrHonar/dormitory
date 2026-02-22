import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetDormitories } from "@/app/data/admin/admin-get-dormitories";
import { getUserPermissions } from "@/lib/has-permission";

export default async function Page() {
  const perms = await getUserPermissions();

  const canRead = perms.has("dormitories:read");
  const canCreate = perms.has("dormitories:create");

  // If no read permission, fetch nothing
  const data = canRead ? ((await adminGetDormitories()) ?? []) : [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        {/* Hide create button if no create permission */}
        {canCreate && (
          <Link
            href="/admin/dormitory/create"
            className={buttonVariants({ variant: "default" })}
          >
            زیادکردن
            <PlusIcon />
          </Link>
        )}

        <p className="text-xl font-bold py-4">لیستی بەشە ناوخۆییەکان</p>
      </div>

      {/* Hide entire table if no read permission */}
      {canRead ? (
        <div className="container mx-auto" dir="rtl">
          <DataTable columns={columns} data={data} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          You don&apos;t have permission to view this data.
        </div>
      )}
    </section>
  );
}
