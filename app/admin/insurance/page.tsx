import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetInsurances } from "@/app/data/admin/admin-get-insurances";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function InsurancePage() {
  const canRead = await hasPermission("insurance:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  const canCreate = await hasPermission("insurance:create");

  const data = (await adminGetInsurances()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        {canCreate && (
          <Link
            href="/admin/insurance/create"
            className={buttonVariants({ variant: "default" })}
          >
            زیادکردن
            <PlusIcon />
          </Link>
        )}

        <p className="text-xl font-bold py-4">لیستی بارمتە</p>
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
