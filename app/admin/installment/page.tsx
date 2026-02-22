import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetInstallments } from "@/app/data/admin/admin-get-installments";

export default async function Page() {
  await requireRole(ROLES.SUPER_ADMIN);

  const data = (await adminGetInstallments()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link
          href="/admin/installment/create"
          className={buttonVariants({ variant: "default" })}
        >
          زیادکردن
          <PlusIcon />
        </Link>

        <p className="text-xl font-bold py-4">لیستی کرێیەکان</p>
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
