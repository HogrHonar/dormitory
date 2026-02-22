import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetInsurances } from "@/app/data/admin/admin-get-insurances";

export default async function InsurancePage() {
  await requireRole(ROLES.SUPER_ADMIN);

  const data = (await adminGetInsurances()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link
          href="/admin/insurance/create"
          className={buttonVariants({ variant: "default" })}
        >
          زیادکردن
          <PlusIcon />
        </Link>

        <p className="text-xl font-bold py-4">لیستی بارمتە</p>
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
