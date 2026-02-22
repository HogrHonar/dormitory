import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  adminGetOutgoingPayments,
  adminGetAvailableBalance,
} from "@/app/data/admin/admin-get-outgoing-payments";

export default async function OutgoingPaymentPage() {
  await requireRole(ROLES.SUPER_ADMIN);

  const [data, availableBalance] = await Promise.all([
    adminGetOutgoingPayments(),
    adminGetAvailableBalance(),
  ]);

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <Link
          href="/admin/outgoing-payment/create"
          className={buttonVariants({ variant: "default" })}
        >
          داواکاری نوێ
          <PlusIcon />
        </Link>

        <p className="text-xl font-bold py-4">لیستی پارەی دەرچووەکان</p>
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
