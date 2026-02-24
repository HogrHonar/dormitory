import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  adminGetOutgoingPayments,
  adminGetAvailableBalance,
} from "@/app/data/admin/admin-get-outgoing-payments";
import { getUserPermissions } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function OutgoingPaymentPage() {
  const perms = await getUserPermissions();

  const canRead = perms.has("outgoing-payments:read");
  const canCreate = perms.has("outgoing-payments:create");

  if (!canRead) redirect("/unauthorized");

  const [data, availableBalance] = await Promise.all([
    adminGetOutgoingPayments(),
    adminGetAvailableBalance(),
  ]);

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold py-4">لیستی پارەی دەرچووەکان</p>
        {canCreate && (
          <Link
            href="/admin/outgoing-payment/create"
            className={buttonVariants({ variant: "default" })}
          >
            داواکاری نوێ
            <PlusIcon />
          </Link>
        )}
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable
          columns={columns}
          data={data}
          availableBalance={availableBalance}
        />
      </div>
    </section>
  );
}
