import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetFees } from "@/app/data/admin/admin-get-fees";

export default async function Page() {
  await requireRole(ROLES.SUPER_ADMIN);
  const data = (await adminGetFees()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/admin/fees/create"
        >
          زیادکردن
          <PlusIcon />
        </Link>
        <p className="text-xl font-bold py-4">لیستی کرێی بەشە ناوخۆیی</p>
      </div>
      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
