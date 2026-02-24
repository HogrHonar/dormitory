import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetFees } from "@/app/data/admin/admin-get-fees";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function Page() {
  const canRead = await hasPermission("fees:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  const canCreate = await hasPermission("fees:create");

  const data = (await adminGetFees()) ?? [];

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        {canCreate && (
          <Link
            className={buttonVariants({ variant: "default" })}
            href="/admin/fees/create"
          >
            زیادکردن
            <PlusIcon />
          </Link>
        )}
        <p className="text-xl font-bold py-4">لیستی کرێی بەشە ناوخۆیی</p>
      </div>
      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
